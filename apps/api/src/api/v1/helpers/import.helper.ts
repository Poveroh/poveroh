import prisma from '@poveroh/prisma'
import { nowAsISOString } from '@poveroh/utils'
import { v4 as uuidv4 } from 'uuid'
import CategoryTemplate from '../content/template/category'
import { ReadedTransaction } from '@poveroh/types'
import { Transaction } from '@poveroh/types'

export const ImportHelper = {
    /**
     * Normalize transactions from raw data.
     *
     * The algorithm searches back similar existing transactions and subscriptions
     * to fill new transactions with the correct data (category, subcategory, etc).
     * It queries the database directly for matching transactions and subscriptions.
     *
     * @param idUser User ID
     * @param financialAccountId Bank Account ID
     * @param rawTransactions Array of raw transactions
     * @returns Promise of normalized transactions
     */
    async normalizeTransaction(
        userId: string,
        financialAccountId: string,
        rawTransactions: ReadedTransaction[]
    ): Promise<Transaction[]> {
        const transactions: Transaction[] = []

        for (const rawTransaction of rawTransactions) {
            const transactionId = uuidv4()

            // Search for similar existing transaction in DB
            const similarTransaction = await prisma.transaction.findFirst({
                where: {
                    userId: userId,
                    title: rawTransaction.title.trim(),
                    amounts: {
                        some: {
                            amount: rawTransaction.amount,
                            currency: rawTransaction.currency
                        }
                    }
                },
                include: {
                    amounts: true
                }
            })

            // Search for matching subscription in DB
            const matchingSubscription = await prisma.subscription.findFirst({
                where: {
                    userId: userId,
                    title: rawTransaction.title.trim(),
                    amount: rawTransaction.amount,
                    currency: rawTransaction.currency
                }
            })

            transactions.push({
                id: transactionId,
                userId: userId,
                createdAt: nowAsISOString(),
                status: 'IMPORT_PENDING',
                importId: null,
                updatedAt: nowAsISOString(),
                amounts: [
                    //TODO: optimize this by creating the amounts in batch after creating all transactions, to avoid multiple DB calls in a loop. This will require to change the structure of the code a bit, maybe by first creating all transactions without amounts, then creating all amounts with the correct transactionId.
                    // {
                    //     id: uuidv4(),
                    //     createdAt: nowAsISOString(),
                    //     transactionId: transactionId,
                    //     amount: rawTransaction.amount,
                    //     currency: rawTransaction.currency,
                    //     action: rawTransaction.action,
                    //     financialAccountId: financialAccountId,
                    //     updatedAt: nowAsISOString(),
                    //     deletedAt: ''
                    // }
                ],
                media: [],
                transferId: null,
                transferHash: null,
                title: similarTransaction?.title || matchingSubscription?.title || rawTransaction.title,
                action: rawTransaction.action,
                categoryId: similarTransaction?.categoryId || null,
                subcategoryId: similarTransaction?.subcategoryId || null,
                icon: similarTransaction?.icon || matchingSubscription?.appearanceLogoIcon || null,
                date: rawTransaction.date,
                note: similarTransaction?.note || '',
                ignore: false
            })
        }

        return transactions
    }
}
