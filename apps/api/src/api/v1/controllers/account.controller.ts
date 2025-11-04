import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { IFinancialAccount, IFinancialAccountBase, IFinancialAccountFilters } from '@poveroh/types'
import { MediaHelper } from '../../../helpers/media.helper'
import { buildWhere } from '../../../helpers/filter.helper'
import logger from '../../../utils/logger'

export class FinancialAccountController {
    //POST /
    static async add(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            let readedAccount: IFinancialAccountBase = JSON.parse(req.body.data)

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/financial-account/${readedAccount.title}`
                )
                readedAccount.logoIcon = filePath
            }

            let account = await prisma.financialAccount.create({
                data: { ...readedAccount, userId: req.user.id }
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

            let readedAccount: IFinancialAccount = JSON.parse(req.body.data)

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/financial-account/${readedAccount.title}`
                )
                readedAccount.logoIcon = filePath
            }

            const account = await prisma.financialAccount.update({
                where: {
                    id: readedAccount.id
                },
                data: {
                    title: readedAccount.title,
                    description: readedAccount.description,
                    type: readedAccount.type,
                    logoIcon: readedAccount.logoIcon
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

            await prisma.financialAccount.delete({
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
            const filters = req.query as unknown as IFinancialAccountFilters
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const where = buildWhere(filters)

            const data = await prisma.financialAccount.findMany({
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
