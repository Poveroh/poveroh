import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import _ from 'lodash'
import { TransactionHelper } from '../helpers/transaction.helper'
import { buildWhere } from '../helpers/filter.helper'
import { ITransactionFilters } from '@poveroh/types'

export class TransactionController {
    static async add(req: Request, res: Response) {
        try {
            const { data, action } = req.body

            if (!data || !action) {
                res.status(400).json({ message: 'Data or action not provided' })
                return
            }

            let parsedData = JSON.parse(data)

            const userId = req.user.id

            const result = await TransactionHelper.handleTransaction(action, parsedData, userId)
            res.status(200).json(result)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async save(req: Request, res: Response) {
        try {
        } catch (error) {
            console.error('Error updating transaction:', error)
            res.status(500).json({
                message: 'An error occurred while updating the transaction',
                error: process.env.NODE_ENV === 'production' ? undefined : error
            })
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            await prisma.transactions.delete({
                where: req.body
            })

            res.status(200).json(true)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async read(req: Request, res: Response) {
        try {
            const filters: ITransactionFilters | string[] = req.body
            const isArrayRequest = Array.isArray(filters)

            const where = isArrayRequest
                ? { id: { in: filters } }
                : {
                      ...buildWhere(filters),
                      ...(filters.fromDate && {
                          date: {
                              ...(filters.date || {}),
                              gte: new Date(filters.fromDate)
                          }
                      })
                  }

            const data = await prisma.transactions.findMany({
                where,
                include: { amounts: true },
                orderBy: { created_at: 'desc' }
            })

            res.status(200).json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
