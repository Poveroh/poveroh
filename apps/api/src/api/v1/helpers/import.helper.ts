import prisma, { Prisma } from '@poveroh/prisma'
import { v4 as uuidv4 } from 'uuid'
import type { CurrencyEnum, ReadedTransaction, TransactionEnrichment } from '@poveroh/types'

export type NormalizedImport = {
    transactions: Prisma.TransactionCreateManyInput[]
    amounts: Prisma.AmountCreateManyInput[]
}

export const ImportHelper = {
    /**
     * Looks up a similar existing transaction and a matching subscription for the given title
     * and amount, and derives the category, subcategory, icon, note and title a new transaction
     * should be created with. Shared by CSV import normalization and bank-sync transaction creation
     * so both get the same history-based categorization.
     */
    async enrichTransaction(
        userId: string,
        title: string,
        amount: number,
        currency: CurrencyEnum
    ): Promise<TransactionEnrichment> {
        const trimmedTitle = title.trim()

        const similarTransaction = await prisma.transaction.findFirst({
            where: {
                userId,
                title: trimmedTitle,
                amounts: {
                    some: {
                        amount,
                        currency
                    }
                }
            }
        })

        const matchingSubscription = await prisma.subscription.findFirst({
            where: {
                userId,
                title: trimmedTitle,
                amount,
                currency
            }
        })

        return {
            title: similarTransaction?.title || matchingSubscription?.title || trimmedTitle,
            categoryId: similarTransaction?.categoryId || null,
            subcategoryId: similarTransaction?.subcategoryId || null,
            icon: similarTransaction?.icon || matchingSubscription?.appearanceLogoIcon || null,
            note: similarTransaction?.note || null
        }
    },

    /**
     * Normalize transactions from raw data, returning Prisma-ready create inputs
     * for both transactions and their amounts. Amounts are keyed by `transactionId`
     * so they can be inserted in a single batch after the transactions are created.
     *
     * The algorithm searches back similar existing transactions and subscriptions
     * to fill new transactions with the correct data (category, subcategory, etc).
     */
    async normalizeTransaction(
        userId: string,
        financialAccountId: string,
        importId: string,
        rawTransactions: ReadedTransaction[]
    ): Promise<NormalizedImport> {
        const transactions: Prisma.TransactionCreateManyInput[] = []
        const amounts: Prisma.AmountCreateManyInput[] = []

        for (const rawTransaction of rawTransactions) {
            const transactionId = uuidv4()

            const enrichment = await this.enrichTransaction(
                userId,
                rawTransaction.title,
                rawTransaction.amount,
                rawTransaction.currency
            )

            transactions.push({
                id: transactionId,
                userId,
                importId,
                status: 'IMPORT_PENDING',
                title: enrichment.title,
                action: rawTransaction.action,
                categoryId: enrichment.categoryId,
                subcategoryId: enrichment.subcategoryId,
                icon: enrichment.icon,
                date: new Date(rawTransaction.date),
                note: enrichment.note,
                ignore: false
            })

            amounts.push({
                transactionId,
                amount: rawTransaction.amount,
                currency: rawTransaction.currency,
                action: rawTransaction.action,
                financialAccountId
            })
        }

        return { transactions, amounts }
    }
}
