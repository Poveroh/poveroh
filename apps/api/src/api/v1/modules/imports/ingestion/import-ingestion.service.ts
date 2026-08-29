import prisma from '@poveroh/prisma'
import { v4 as uuidv4 } from 'uuid'
import type { ImportData, ImportIngestionRequest } from '@poveroh/types'
import { eventBus } from '@/v1/worker/events/event-bus'
import { BaseService } from '../../base/base.service'
import { ImportRepository } from '../import.repository'
import { ImportProcessingService } from '../processing/import-processing.service'

/**
 * The single entry point for creating an import, whatever produced its transactions: a CSV upload,
 * a bank-sync run, or any source added later.
 *
 * A source is responsible for one thing — handing over normalized transactions, or the files they
 * can be parsed from. Everything after that (opening the import, recording where it came from,
 * enrichment, review) happens here, once.
 */
export class ImportIngestionService extends BaseService {
    private readonly importRepository = new ImportRepository()

    constructor() {
        super('import')
    }

    /**
     * Opens an import for the given source, persists its input, and processes it into reviewable
     * transactions.
     * @param request What the source is delivering and where it belongs.
     * @param files The uploaded files, for sources that deliver files rather than transactions.
     * @returns A promise that resolves to the created import.
     */
    async ingest(request: ImportIngestionRequest, files: Express.Multer.File[] = []): Promise<ImportData> {
        const userId = this.context.currentUser.id
        const now = new Date()

        const open = await this.findOpenImport(userId, request)
        if (open) return this.appendTo(userId, open, request)

        const importId = uuidv4()

        const storedFiles = await Promise.all(
            files.map(async file => ({
                filename: file.originalname,
                path: await this.media.saveFile(importId, file)
            }))
        )

        await prisma.$transaction(async tx => {
            await this.importRepository.create(tx, {
                id: importId,
                userId,
                financialAccountId: request.financialAccountId,
                title: this.buildTitle(request, now),
                status: 'PENDING_REVIEW',
                source: request.source,
                sourceReference: request.sourceReference ?? null,
                bankConnectionId: request.bankConnectionId ?? null,
                autoApprove: request.autoApprove,
                createdAt: now
            })

            await this.importRepository.createImportFiles(
                tx,
                storedFiles.map(file => ({
                    importId,
                    filename: file.filename,
                    filetype: 'CSV',
                    path: file.path
                }))
            )
        })

        // Staged outside the transaction above so a large batch does not hold it open; the import
        // already exists, so a failure here leaves it empty and retryable rather than orphaned.
        await this.importRepository.createStagedTransactions(importId, request.transactions ?? [])

        await new ImportProcessingService().process(importId)

        const data = await this.importRepository.findByIdOrThrow(userId, importId)
        await eventBus.emit('import.created', { userId, data })

        return data
    }

    /**
     * Finds the import a recurring source should keep filling instead of opening a new one: a
     * connection that syncs nightly would otherwise leave a separate import behind on every run.
     * Only imports still awaiting review qualify — once reviewed, the next sync starts a fresh one.
     * @param userId The ID of the user who owns the import.
     * @param request The ingestion request being handled.
     * @returns A promise that resolves to the open import id, or null when a new one should be opened.
     */
    private async findOpenImport(userId: string, request: ImportIngestionRequest): Promise<string | null> {
        if (!request.bankConnectionId) return null

        const open = await this.importRepository.findOpenSourceImport(
            userId,
            request.financialAccountId,
            request.bankConnectionId
        )

        return open?.id ?? null
    }

    /**
     * Stages and processes transactions into an import that is already open for review.
     * @param userId The ID of the user who owns the import.
     * @param importId The open import to append to.
     * @param request What the source is delivering.
     * @returns A promise that resolves to the updated import.
     */
    private async appendTo(userId: string, importId: string, request: ImportIngestionRequest): Promise<ImportData> {
        await this.importRepository.createStagedTransactions(importId, request.transactions ?? [])
        await new ImportProcessingService().process(importId)

        const data = await this.importRepository.findByIdOrThrow(userId, importId)
        await eventBus.emit('import.updated', { userId, data })

        return data
    }

    /**
     * Builds the default title of an import. Users cannot rename an import yet, so this stays
     * server-generated and in English for now.
     * @param request The ingestion request the import was opened for.
     * @param now The creation time.
     * @returns The title to store.
     */
    private buildTitle(request: ImportIngestionRequest, now: Date): string {
        const timestamp = now.toLocaleString()

        switch (request.source) {
            case 'BANK_SYNC':
                return request.sourceReference
                    ? `Import via bank sync by ${request.sourceReference} at ${timestamp}`
                    : `Import via bank sync at ${timestamp}`
            case 'MANUAL':
                return `Import via manual entry at ${timestamp}`
            case 'API':
                return `Import via API at ${timestamp}`
            default:
                return `Import via CSV at ${timestamp}`
        }
    }
}
