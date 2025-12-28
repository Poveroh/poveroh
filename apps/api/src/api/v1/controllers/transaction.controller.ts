import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { TransactionHelper } from '../helpers/transaction.helper'
import { buildWhere } from '../../../helpers/filter.helper'
import { IFilterOptions, ITransactionFilters } from '@poveroh/types'
import logger from '../../../utils/logger'
import { TransactionStatus } from '@prisma/client'
import { TransactionWithAmounts } from '@/types/transactions'
import { assert } from 'node:console'

export class TransactionController {
    //POST /
    static async add(req: Request, res: Response) {
        try {
            const { data, action } = req.body

            if (!data || !action) {
                res.status(400).json({ message: 'Data or action not provided' })
                return
            }

            const parsedData = JSON.parse(data)
            const userId = req.user.id

            const result = await TransactionHelper.handleTransaction(action, parsedData, userId)
            res.status(200).json(result)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //POST /:id
    static async save(req: Request, res: Response) {
        try {
            const { id } = req.params
            const { data, action } = req.body

            if (!id || !data) {
                res.status(400).json({ message: 'Missing transaction ID or data' })
                return
            }
            if (!action) {
                res.status(400).json({ message: 'Missing transaction action for update' })
                return
            }

            const parsedData = JSON.parse(data)

            const result = await TransactionHelper.handleTransaction(action, parsedData, req.user.id, id)

            res.status(200).json(result)
        } catch (error) {
            logger.error(error)
            res.status(500).json({
                message: 'An error occurred while updating the transaction',
                error: process.env.NODE_ENV === 'production' ? undefined : error
            })
        }
    }

    //DELETE /:id
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params

            if (!id) {
                res.status(400).json({ message: 'Missing transaction ID' })
                return
            }

            await prisma.transaction.delete({
                where: { id }
            })

            res.status(200).json(true)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //GET /
    static async read(req: Request, res: Response) {
        try {
            const rawFilters = req.query['filter'] || {}
            const rawOptions = req.query['options'] || {}

            const filters = rawFilters as ITransactionFilters
            const options = rawOptions as IFilterOptions

            const skip = isNaN(Number(options.skip)) ? 0 : Number(options.skip)
            const take = isNaN(Number(options.take)) ? undefined : Number(options.take)
            const sortBy = options.sortBy || 'date'
            const sortOrder = options.sortOrder || 'desc'

            // Extract transaction-specific filters that need special handling
            const { type, financialAccountId, ...genericFilters } = filters

            const where = {
                ...buildWhere(genericFilters),
                status: TransactionStatus.APPROVED,
                // Map 'type' to 'action' for Transaction model
                ...(type && { action: type }),
                // Handle financialAccountId filter through amounts relation
                ...(financialAccountId && {
                    amounts: {
                        some: {
                            financialAccountId
                        }
                    }
                })
            }

            // Build orderBy dynamically
            let orderBy: any = {}
            let sortInMemory = false

            if (sortBy === 'category') {
                orderBy = { category: { title: sortOrder } }
            } else if (sortBy === 'subcategory') {
                orderBy = { subcategory: { title: sortOrder } }
            } else if (sortBy === 'amount') {
                // Amount is in a related table, we'll sort in memory after fetching
                sortInMemory = true
                orderBy = { date: 'desc' } // Default order for fetching
            } else {
                orderBy = { [sortBy]: sortOrder }
            }

            const queryOptions: any = {
                where,
                include: { amounts: true },
                orderBy,
                skip: sortInMemory ? 0 : skip // If sorting in memory, fetch all first
            }

            if (!sortInMemory && take && take > 0) {
                queryOptions.take = take
            }

            const [rawData, total] = await Promise.all([
                prisma.transaction.findMany(queryOptions),
                prisma.transaction.count({ where })
            ])

            // Cast to the proper type with included relations
            const data = rawData as TransactionWithAmounts[]

            // Sort by amount in memory if needed
            let finalData: TransactionWithAmounts[] = data
            if (sortInMemory && sortBy === 'amount') {
                finalData = data.sort((a, b) => {
                    const amountA = Number(a.amounts[0]?.amount || 0)
                    const amountB = Number(b.amounts[0]?.amount || 0)
                    return sortOrder === 'asc' ? amountA - amountB : amountB - amountA
                })

                // Apply pagination after sorting
                finalData = finalData.slice(skip, take ? skip + take : undefined)
            }

            res.status(200).json({ data: finalData, total })
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
