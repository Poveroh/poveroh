import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import _ from 'lodash'
import { TransactionHelper } from '../helpers/transaction.helper'

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
            const { id, title, description } = req.body

            const sql: any = {
                where: {},
                orderBy: {
                    created_at: 'desc'
                }
            }

            if (Array.isArray(req.body)) {
                sql.where = {
                    id: {
                        in: req.body
                    }
                }
            } else if (!_.isEmpty(req.body)) {
                sql.where = {
                    OR: [
                        id && { id },
                        title && { title: { contains: title, mode: 'insensitive' } },
                        description && { description: { contains: description, mode: 'insensitive' } }
                    ].filter(Boolean)
                }
            }

            const data = await prisma.transactions.findMany(sql)

            res.status(200).json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
