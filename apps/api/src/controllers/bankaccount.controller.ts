import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { IBankAccount } from '@poveroh/types'
import { BeyCloud } from 'beycloud'

export class BankAccountController {
    static async add(req: Request, res: Response) {
        try {
            const account = await prisma.bank_accounts.create({
                data: req.body
            })

            res.status(200).json(account)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async save(req: Request, res: Response) {
        try {
            const bankAccountToSave: IBankAccount = req.body as IBankAccount

            const account = await prisma.bank_accounts.update({
                where: {
                    id: bankAccountToSave.id
                },
                data: {
                    title: bankAccountToSave.title,
                    description: bankAccountToSave.description,
                    type: bankAccountToSave.type,
                    logo_icon: bankAccountToSave.logo_icon
                }
            })

            res.status(200).json(account)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const t = await prisma.bank_accounts.delete({
                where: req.body
            })

            res.status(200).json(true)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async read(req: Request, res: Response) {
        try {
            let sql = {}

            if (Array.isArray(req.body)) {
                sql = {
                    where: {
                        id: {
                            in: req.body
                        }
                    }
                }
            } else if (typeof req.body === 'string') {
                sql = {
                    where: {
                        id: req.body
                    }
                }
            }

            const accounts = await prisma.bank_accounts.findMany(sql)

            res.status(200).json(accounts)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async upload(req: Request, res: Response) {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No file uploaded' })
                return
            }
            const uploadClient = new BeyCloud('local', {
                basePath: process.env.CDN_DATA_PATH as string
            })

            uploadClient.uploadFile(req.file.originalname, req.file.buffer)

            // The file is available in `req.file`
            console.log('File uploaded:', req.file)
            res.status(200).json({ message: 'File uploaded successfully', file: req.file })
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
