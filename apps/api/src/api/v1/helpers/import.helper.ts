import prisma from '@poveroh/prisma'
import { TransactionStatus, ITransaction, IReadedTransaction } from '@poveroh/types'
import { nowAsISOString } from '@poveroh/utils'
import { v4 as uuidv4 } from 'uuid'
import CategoryTemplate from '../content/template/category'

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
        rawTransactions: IReadedTransaction[]
    ): Promise<ITransaction[]> {
        const transactions: ITransaction[] = []

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
                status: TransactionStatus.IMPORT_PENDING,
                importId: undefined,
                updatedAt: nowAsISOString(),
                amounts: [
                    {
                        id: uuidv4(),
                        createdAt: nowAsISOString(),
                        transactionId: transactionId,
                        amount: rawTransaction.amount,
                        currency: rawTransaction.currency,
                        action: rawTransaction.action,
                        financialAccountId: financialAccountId
                    }
                ],
                media: undefined,
                transferId: undefined,
                transferHash: undefined,
                title: similarTransaction?.title || matchingSubscription?.title || rawTransaction.title,
                action: rawTransaction.action,
                categoryId: similarTransaction?.categoryId || undefined,
                subcategoryId: similarTransaction?.subcategoryId || undefined,
                icon: similarTransaction?.icon || matchingSubscription?.appearanceLogoIcon || undefined,
                date: rawTransaction.date,
                note: similarTransaction?.note || '',
                ignore: false
            })
        }

        return transactions
    },
    async importCategoriesFromTemplate(userId: string): Promise<boolean> {
        try {
            for (const category of CategoryTemplate) {
                const newCategory = await prisma.category.create({
                    data: {
                        userId: userId,
                        title: category.title,
                        description: category.description,
                        for: category.for,
                        logoIcon: category.logoIcon,
                        color: category.color
                    }
                })

                for (const subcategory of category.subcategories) {
                    await prisma.subcategory.create({
                        data: {
                            categoryId: newCategory.id,
                            title: subcategory.title,
                            description: subcategory.description,
                            logoIcon: subcategory.logoIcon
                        }
                    })
                }
            }

            return true
        } catch (error) {
            console.error('Error importing categories from template:', error)
            return false
        }
    }
}
