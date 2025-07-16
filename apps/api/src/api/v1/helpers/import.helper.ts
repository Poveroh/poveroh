import prisma from '@poveroh/prisma'
import { TransactionStatus, ITransaction } from '@poveroh/types'
import { IReadedTransaction } from '@poveroh/types'
import { v4 as uuidv4 } from 'uuid'

export const ImportHelper = {
    /**
     * Normalize transactions from raw data.
     *
     * The algorithm search back simil existing transactions and subscription to fill new transactions with the correct data.
     *
     * @param idUser User ID
     * @param bankAccountId Bank Account ID
     * @param rawTransactions Array of raw transactions
     * @returns Normalized transactions
     */
    /**
     * Normalize transactions from raw data.
     *
     * The algorithm searches back similar existing transactions and subscriptions
     * to fill new transactions with the correct data (category, subcategory, etc).
     * It queries the database directly for matching transactions and subscriptions.
     *
     * @param prisma Prisma client instance
     * @param idUser User ID
     * @param bankAccountId Bank Account ID
     * @param rawTransactions Array of raw transactions
     * @returns Promise of normalized transactions
     */
    async normalizeTransaction(
        idUser: string,
        bankAccountId: string,
        rawTransactions: IReadedTransaction[]
    ): Promise<ITransaction[]> {
        const transactions: ITransaction[] = []

        for (const rawTransaction of rawTransactions) {
            const transactionId = uuidv4()

            // Search for similar existing transaction in DB
            const similarTransaction = await prisma.transactions.findFirst({
                where: {
                    user_id: idUser,
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
            const matchingSubscription = await prisma.subscriptions.findFirst({
                where: {
                    user_id: idUser,
                    title: rawTransaction.title.trim(),
                    amount: rawTransaction.amount,
                    currency: rawTransaction.currency
                }
            })

            transactions.push({
                id: transactionId,
                user_id: idUser,
                created_at: new Date(),
                amounts: [
                    {
                        id: uuidv4(),
                        created_at: new Date().toISOString(),
                        transaction_id: transactionId,
                        amount: rawTransaction.amount,
                        currency: rawTransaction.currency,
                        action: rawTransaction.type,
                        bank_account_id: bankAccountId
                    }
                ],
                title: similarTransaction?.title || matchingSubscription?.title || rawTransaction.title,
                type: rawTransaction.type,
                date: rawTransaction.date.toISOString(),
                status: TransactionStatus.IMPORT_PENDING,
                note: similarTransaction?.note || '',
                ignore: false,
                category_id: similarTransaction?.category_id || undefined,
                subcategory_id: similarTransaction?.subcategory_id || undefined,
                import_id: undefined,
                icon: similarTransaction?.icon || matchingSubscription?.appearance_logo_icon || undefined
            } as ITransaction)
        }

        return transactions
    }
}
