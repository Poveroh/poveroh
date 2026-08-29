import prisma from '@poveroh/prisma'
import { logger } from '@poveroh/logger/server'
import { v4 as uuidv4 } from 'uuid'
import type {
    ImportCandidateTransaction,
    ImportEnrichment,
    ImportSourceEnum,
    ImportSourceReader,
    ImportTransactionDraft
} from '@poveroh/types'
import { NotFoundError } from '@/utils'
import { BaseService } from '../../base/base.service'
import { EnrichmentPipeline } from '../enrichment/enrichment.pipeline'
import { ImportRepository } from '../import.repository'
import { ImportService } from '../import.service'
import { CsvImportSourceReader } from '../ingestion/readers/csv-import.reader'
import { ExternalImportSourceReader } from '../ingestion/readers/external-import.reader'

/**
 * Turns an import's raw input into reviewable transactions: reads the candidates from whichever
 * source produced them, enriches the batch, and persists the result.
 *
 * Every source converges here, so the enrichment, the transaction shape and the review lifecycle
 * are defined once regardless of where the transactions came from.
 */
export class ImportProcessingService extends BaseService {
    private readonly importRepository = new ImportRepository()
    private readonly enrichmentPipeline = new EnrichmentPipeline()
    private readonly importService = new ImportService()

    constructor() {
        super('import')
    }

    /**
     * Processes an import end to end and leaves it ready for review.
     * @param importId The import to process.
     * @returns A promise that resolves to the number of transactions created.
     */
    async process(importId: string): Promise<number> {
        const userId = this.context.currentUser.id

        const target = await this.importRepository.findProcessingTarget(userId, importId)
        if (!target) throw new NotFoundError('Import not found')

        try {
            const candidates = await this.readerFor(target.source).read(importId)
            const enrichments = await this.enrichmentPipeline.run(userId, candidates)

            const drafts = candidates.map((candidate, index) =>
                this.toDraft(candidate, enrichments[index] ?? {}, {
                    userId,
                    importId,
                    financialAccountId: target.financialAccountId,
                    bankConnectionId: target.bankConnectionId
                })
            )

            await prisma.$transaction(async tx => {
                await this.importRepository.createTransactionDrafts(tx, drafts)
                await this.importRepository.deleteStagedTransactions(tx, importId)
                await this.importRepository.updateStatus(tx, userId, importId, 'PENDING_REVIEW')
            })

            if (target.autoApprove && drafts.length > 0) {
                await this.importService.approveAllTransactions(importId)
            }

            return drafts.length
        } catch (error) {
            const reason = error instanceof Error ? error.message : 'Unknown import processing error'

            logger.error('Import processing failed', { userId, importId, error })
            await this.importRepository.markFailed(userId, importId, reason)

            throw error
        }
    }

    /**
     * Picks the reader that knows how to recover the transactions of a given source.
     * @param source The source the import came from.
     * @returns The reader for that source.
     */
    private readerFor(source: ImportSourceEnum): ImportSourceReader {
        if (source === 'CSV') return new CsvImportSourceReader(this.media)

        return new ExternalImportSourceReader(source)
    }

    /**
     * Combines a candidate with what the enrichment pipeline derived for it into the row to persist.
     * @param candidate The normalized transaction read from the source.
     * @param enrichment What the pipeline derived for it.
     * @param context The import-wide values every draft carries.
     * @returns The draft ready to be persisted.
     */
    private toDraft(
        candidate: ImportCandidateTransaction,
        enrichment: ImportEnrichment,
        context: {
            userId: string
            importId: string
            financialAccountId: string
            bankConnectionId: string | null
        }
    ): ImportTransactionDraft {
        return {
            id: uuidv4(),
            userId: context.userId,
            importId: context.importId,
            financialAccountId: context.financialAccountId,
            date: candidate.date,
            title: enrichment.title ?? candidate.title.trim(),
            action: candidate.action,
            amount: candidate.amount,
            currency: candidate.currency,
            categoryId: enrichment.categoryId ?? null,
            subcategoryId: enrichment.subcategoryId ?? null,
            subscriptionId: enrichment.subscriptionId ?? null,
            icon: enrichment.icon ?? null,
            note: enrichment.note ?? null,
            bankConnectionId: context.bankConnectionId,
            bankSyncAccountId: candidate.bankSyncAccountId ?? null,
            externalTransactionId: candidate.externalTransactionId ?? null
        }
    }
}
