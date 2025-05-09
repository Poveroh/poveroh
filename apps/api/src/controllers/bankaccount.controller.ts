import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { IBankAccount, IBankAccountBase } from '@poveroh/types'
import _ from 'lodash'
import { MediaHelper } from '../helpers/media.helper'

export class BankAccountController {
    static async add(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            let readedBankAccount: IBankAccountBase = JSON.parse(req.body.data)

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/bankaccount/${readedBankAccount.title}`
                )
                readedBankAccount.logo_icon = filePath
            }

            let account = await prisma.bank_accounts.create({
                data: { ...readedBankAccount, user_id: req.user.id }
            })

            res.status(200).json(account)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async save(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            let readedBankAccount: IBankAccount = JSON.parse(req.body.data)

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/bankaccount/${readedBankAccount.title}`
                )
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

            const accounts = await prisma.bank_accounts.findMany(sql)

            res.status(200).json(accounts)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
