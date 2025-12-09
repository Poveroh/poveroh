import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { TransactionHelper } from '../helpers/transaction.helper'
import { buildWhere } from '../../../helpers/filter.helper'
import { IFilterOptions, ITransaction, ITransactionFilters } from '@poveroh/types'
import logger from '../../../utils/logger'
import { TransactionStatus } from '@prisma/client'

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

            const filters = rawFilters as unknown as ITransactionFilters
            const options = rawOptions as unknown as IFilterOptions

            const skip = isNaN(Number(options.skip)) ? 0 : Number(options.skip)
            const take = isNaN(Number(options.take)) ? undefined : Number(options.take)

            const where = {
                ...buildWhere(filters),
                status: TransactionStatus.APPROVED,
                ...(filters.fromDate && {
                    date: {
                        ...(filters.date || {}),
                        gte: new Date(filters.fromDate)
                    }
                })
            }

            const queryOptions: any = {
                where,
                include: { amounts: true },
                orderBy: { createdAt: 'desc' },
                skip
            }

            if (take && take > 0) {
                queryOptions.take = take
            }

            const data = await prisma.transaction.findMany(queryOptions)

            res.status(200).json(data)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
