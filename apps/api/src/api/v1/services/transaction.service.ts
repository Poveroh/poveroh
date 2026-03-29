import prisma from '@poveroh/prisma'
import { buildWhere } from '../../../helpers/filter.helper'
import { TransactionHelper } from '../helpers/transaction.helper'
import { FilterOptions, QueryTransactionFilters, TransactionDataResponse, TransactionFilters } from '@poveroh/types'
import { TransactionWithAmounts } from '@/types/transactions'
import { BaseService } from './base.service'

/**
 * Service class for managing transactions, including creation, updates, deletions, and retrieval
 * All methods automatically retrieve the user ID from the request context.
 */
export class TransactionService extends BaseService {
    /**
     * Initializes the TransactionService with the user ID from the request context
     * @param userId The ID of the authenticated user
     */
    constructor(userId: string) {
        super(userId, 'transaction')
    }

    /**
     * Creates or updates a transaction based on the provided action and payload
     * @param action The transaction action type
     * @param payload The transaction payload as a JSON string
     * @param id Optional transaction ID for updates
     * @returns The created or updated transaction result
     */
    async handleTransaction(action: string, payload: string, id?: string): Promise<unknown> {
        const userId = this.getUserId()
        const parsedData = JSON.parse(payload)

        return TransactionHelper.handleTransaction(action, parsedData, userId, id)
    }

    /**
     * Deletes a transaction with the specified ID for the authenticated user
     * @param id The ID of the transaction to delete
     */
    async deleteTransaction(id: string): Promise<void> {
        const userId = this.getUserId()
        await prisma.transaction.delete({
            where: { id, userId }
        })
    }

    /**
     * Deletes all transactions for the authenticated user
     */
    async deleteAllTransactions(): Promise<void> {
        const userId = this.getUserId()
        await prisma.transaction.deleteMany({
            where: { userId }
        })
    }

    /**
     * Retrieves a transaction by its ID for the authenticated user
     * @param id The ID of the transaction to retrieve
     * @returns The transaction data response if found, or null if not found
     */
    async getTransactionById(id: string): Promise<TransactionDataResponse | null> {
        const userId = this.getUserId()
        return (await prisma.transaction.findFirst({
            where: { id, userId },
            omit: { userId: true, deletedAt: true },
            include: { amounts: true, media: true }
        })) as unknown as TransactionDataResponse | null
    }

    /**
     * Retrieves transactions for the authenticated user based on filters, pagination, and sorting options
     * @param query The query filters and options for retrieving transactions
     * @returns An object containing the transaction data and the total count
     */
    async getTransactions(query: QueryTransactionFilters): Promise<{ data: unknown[]; total: number }> {
        const userId = this.getUserId()
        const filters = (query.filter || {}) as TransactionFilters
        const options = (query.options || {}) as FilterOptions

        const skip = isNaN(Number(options.skip)) ? 0 : Number(options.skip)
        const take = isNaN(Number(options.take)) ? undefined : Number(options.take)
        const sortBy = options.sortBy || 'date'
        const sortOrder = options.sortOrder || 'desc'

        const { type, financialAccountId, ...genericFilters } = filters as TransactionFilters & {
            type?: string
            financialAccountId?: string
        }

        const where = {
            ...buildWhere(genericFilters),
            userId,
            status: 'APPROVED',
            ...(type && { action: type }),
            ...(financialAccountId && {
                amounts: {
                    some: {
                        financialAccountId
                    }
                }
            })
        }

        let orderBy: any[] = []
        let sortInMemory = false

        const stableTieBreakers = [{ createdAt: sortOrder }, { id: sortOrder }]

        if (sortBy === 'category') {
            orderBy = [{ category: { title: sortOrder } }, ...stableTieBreakers]
        } else if (sortBy === 'subcategory') {
            orderBy = [{ subcategory: { title: sortOrder } }, ...stableTieBreakers]
        } else if (sortBy === 'amount') {
            sortInMemory = true
            orderBy = [{ date: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }]
        } else {
            orderBy = [{ [sortBy]: sortOrder }, ...stableTieBreakers]
        }

        const queryOptions: any = {
            where,
            include: { amounts: true },
            omit: { userId: true, deletedAt: true },
            orderBy,
            skip: sortInMemory ? 0 : skip
        }

        if (!sortInMemory && take && take > 0) {
            queryOptions.take = take
        }

        const [rawData, total] = await Promise.all([
            prisma.transaction.findMany(queryOptions),
            prisma.transaction.count({ where })
        ])

        const data = rawData as TransactionWithAmounts[]

        let finalData: TransactionWithAmounts[] = data
        if (sortInMemory && sortBy === 'amount') {
            finalData = data.sort((a, b) => {
                const amountA = Number(a.amounts[0]?.amount || 0)
                const amountB = Number(b.amounts[0]?.amount || 0)
                return sortOrder === 'asc' ? amountA - amountB : amountB - amountA
            })

            finalData = finalData.slice(skip, take ? skip + take : undefined)
        }

        const mergedData = TransactionHelper.mergeTransferTransactions(finalData)

        return {
            data: mergedData as unknown[],
            total
        }
    }
}
