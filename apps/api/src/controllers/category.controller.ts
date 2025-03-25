import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { IBankAccount, IBankAccountBase } from '@poveroh/types'
import { isLocalStorageMode, uploadClient } from '../utils/storage'
import { config } from '../utils/environment'
import _ from 'lodash'

export class CategoryController {
    static async add(req: Request, res: Response) {
        try {
            if (!req.body.account) throw new Error('Data not provided')

            let readedBankAccount: IBankAccountBase = JSON.parse(req.body.account)

            if (req.file) {
                const readedUser = req.user.id

                let filePath = `${readedUser}/bankaccount/${readedBankAccount.title}/${req.file.originalname}`

                await uploadClient.uploadFile(filePath, req.file.buffer)

                if (isLocalStorageMode) {
                    const baseCdnUrl = `http://localhost:${config.CDN_PORT}`
                    filePath = new URL(filePath, baseCdnUrl).toString()
                }
                readedBankAccount.logo_icon = filePath
            }

            let account = await prisma.bank_accounts.create({
                data: readedBankAccount
            })

            res.status(200).json(account)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async save(req: Request, res: Response) {
        try {
            if (!req.body.account) throw new Error('Data not provided')

            let readedBankAccount: IBankAccount = JSON.parse(req.body.account)

            if (req.file) {
                const readedUser = req.user.id

                let filePath = `${readedUser}/bankaccount/${readedBankAccount.title}/${req.file.originalname}`

                await uploadClient.uploadFile(filePath, req.file.buffer)

                if (isLocalStorageMode) {
                    const baseCdnUrl = `http://localhost:${config.CDN_PORT}`
                    filePath = new URL(filePath, baseCdnUrl).toString()
                }
                readedBankAccount.logo_icon = filePath
            }

            const account = await prisma.bank_accounts.update({
                where: {
                    id: readedBankAccount.id
                },
                data: {
                    title: readedBankAccount.title,
                    description: readedBankAccount.description,
                    type: readedBankAccount.type,
                    logo_icon: readedBankAccount.logo_icon
                }
            })

            res.status(200).json(account)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            await prisma.bank_accounts.delete({
                where: req.body
            })

            res.status(200).json(true)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async read(req: Request, res: Response) {
        try {
            let sql: any = {}

            if (!_.isEmpty(req.body)) {
                if (_.isArray(req.body)) {
                    sql = {
                        id: {
                            in: req.body
                        }
                    }
                } else {
                    sql = {
                        OR: [
                            { id: req.body.id },
                            { title: { contains: req.body.title, mode: 'insensitive' } },
                            { description: { contains: req.body.description, mode: 'insensitive' } }
                        ]
                    }
                }
            }

            const categories = await prisma.categories.findMany({
                where: sql,
                include: {
                    subcategories: true
                }
            })

            res.status(200).json(categories)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
