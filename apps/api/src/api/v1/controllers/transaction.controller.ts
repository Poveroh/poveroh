import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { TransactionHelper } from '../helpers/transaction.helper'
import { buildWhere } from '../../../helpers/filter.helper'
import { ITransactionFilters } from '@poveroh/types'
import logger from '../../../utils/logger'

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
            const { data } = req.body

            if (!id || !data) {
                res.status(400).json({ message: 'Missing transaction ID or data' })
                return
            }

            const parsedData = JSON.parse(data)

            const transaction = await prisma.transactions.update({
                where: { id },
                data: parsedData
            })

            res.status(200).json(transaction)
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

            await prisma.transactions.delete({
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
            const filters = req.query as unknown as ITransactionFilters
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take)

            const where = {
                ...buildWhere(filters),
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
                orderBy: { created_at: 'desc' },
                skip
            }

            if (!isNaN(take) && take > 0) {
                queryOptions.take = take
            }

            const data = await prisma.transactions.findMany(queryOptions)

            res.status(200).json(data)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
