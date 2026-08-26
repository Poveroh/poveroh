import { Prisma } from '@poveroh/prisma'
import { v4 as uuidv4 } from 'uuid'
import type { ImportCandidateTransaction, ReadedTransaction } from '@poveroh/types'
import { EnrichmentPipeline } from '@/v1/modules/imports/enrichment/enrichment.pipeline'

export type NormalizedImport = {
    transactions: Prisma.TransactionCreateManyInput[]
    amounts: Prisma.AmountCreateManyInput[]
}

export const ImportHelper = {
    /**
     * Normalize transactions from raw data, returning Prisma-ready create inputs for both
     * transactions and their amounts. Amounts are keyed by `transactionId` so they can be inserted
     * in a single batch after the transactions are created.
     *
     * Category, subcategory, subscription, icon and note come from the enrichment pipeline, which
     * looks at the whole batch at once: every strategy loads what it needs in one query up front
     * instead of the import issuing a pair of lookups per row.
     * @param userId The ID of the user the imported transactions belong to.
     * @param financialAccountId The financial account the amounts belong to.
     * @param importId The import the transactions are filed under.
     * @param rawTransactions The transactions read from the source.
     * @returns A promise that resolves to the create inputs for the transactions and their amounts.
     */
    async normalizeTransaction(
        userId: string,
        financialAccountId: string,
        importId: string,
        rawTransactions: ReadedTransaction[]
    ): Promise<NormalizedImport> {
        const transactions: Prisma.TransactionCreateManyInput[] = []
        const amounts: Prisma.AmountCreateManyInput[] = []

        const candidates: ImportCandidateTransaction[] = rawTransactions.map(rawTransaction => ({
            date: rawTransaction.date,
            title: rawTransaction.title,
            amount: rawTransaction.amount,
            currency: rawTransaction.currency,
            action: rawTransaction.action
        }))

        const enrichments = await new EnrichmentPipeline().run(userId, candidates)

        rawTransactions.forEach((rawTransaction, index) => {
            const transactionId = uuidv4()
            const enrichment = enrichments[index] ?? {}

            transactions.push({
                id: transactionId,
                userId,
                importId,
                status: 'IMPORT_PENDING',
                title: enrichment.title ?? rawTransaction.title.trim(),
                action: rawTransaction.action,
                categoryId: enrichment.categoryId ?? null,
                subcategoryId: enrichment.subcategoryId ?? null,
                subscriptionId: enrichment.subscriptionId ?? null,
                icon: enrichment.icon ?? null,
                date: new Date(rawTransaction.date),
                note: enrichment.note ?? null,
                ignore: false
            })

            amounts.push({
                transactionId,
                amount: rawTransaction.amount,
                currency: rawTransaction.currency,
                action: rawTransaction.action,
                financialAccountId
            })
        })

        return { transactions, amounts }
    }
}
