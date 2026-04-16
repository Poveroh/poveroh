import prisma, { Prisma } from '@poveroh/prisma'
import { v4 as uuidv4 } from 'uuid'
import { ReadedTransaction } from '@poveroh/types'

export type NormalizedImport = {
    transactions: Prisma.TransactionCreateManyInput[]
    amounts: Prisma.AmountCreateManyInput[]
}

export const ImportHelper = {
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
            const title = rawTransaction.title.trim()

            const similarTransaction = await prisma.transaction.findFirst({
                where: {
                    userId,
                    title,
                    amounts: {
                        some: {
                            amount: rawTransaction.amount,
                            currency: rawTransaction.currency
                        }
                    }
                }
            })

            const matchingSubscription = await prisma.subscription.findFirst({
                where: {
                    userId,
                    title,
                    amount: rawTransaction.amount,
                    currency: rawTransaction.currency
                }
            })

            transactions.push({
                id: transactionId,
                userId,
                importId,
                status: 'IMPORT_PENDING',
                title: similarTransaction?.title || matchingSubscription?.title || rawTransaction.title,
                action: rawTransaction.action,
                categoryId: similarTransaction?.categoryId || null,
                subcategoryId: similarTransaction?.subcategoryId || null,
                icon: similarTransaction?.icon || matchingSubscription?.appearanceLogoIcon || null,
                date: new Date(rawTransaction.date),
                note: similarTransaction?.note || null,
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
