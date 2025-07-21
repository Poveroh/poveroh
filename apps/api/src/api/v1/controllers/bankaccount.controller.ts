import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { IBankAccount, IBankAccountBase, IBankAccountFilters } from '@poveroh/types'
import { MediaHelper } from '../../../helpers/media.helper'
import { buildWhere } from '../../../helpers/filter.helper'
import logger from '../../../utils/logger'

export class BankAccountController {
    //POST /
    static async add(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            let readedBankAccount: IBankAccountBase = JSON.parse(req.body.data)

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/bankaccount/${readedBankAccount.title}`
                )
                readedBankAccount.logoIcon = filePath
            }

            let account = await prisma.bankAccount.create({
                data: { ...readedBankAccount, userId: req.user.id }
            })

            res.status(200).json(account)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //POST /:id
    static async save(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            let readedBankAccount: IBankAccount = JSON.parse(req.body.data)

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/bankaccount/${readedBankAccount.title}`
                )
                readedBankAccount.logoIcon = filePath
            }

            const account = await prisma.bankAccount.update({
                where: {
                    id: readedBankAccount.id
                },
                data: {
                    title: readedBankAccount.title,
                    description: readedBankAccount.description,
                    type: readedBankAccount.type,
                    logoIcon: readedBankAccount.logoIcon
                }
            })

            res.status(200).json(account)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //DELETE /:id
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params

            await prisma.bankAccount.delete({
                where: { id: id }
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
            const filters = req.query as unknown as IBankAccountFilters
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const where = buildWhere(filters)

            const data = await prisma.bankAccount.findMany({
                where: {
                    ...where,
                    userId: req.user.id
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            })

            res.status(200).json(data)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
