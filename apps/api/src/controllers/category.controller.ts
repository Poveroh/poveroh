import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { IBankAccount, IBankAccountBase, ICategory, ICategoryBase } from '@poveroh/types'
import { isLocalStorageMode, uploadClient } from '../utils/storage'
import { config } from '../utils/environment'
import _ from 'lodash'

export class CategoryController {
    static async add(req: Request, res: Response) {
        try {
            if (!req.body.category) throw new Error('Data not provided')

            let readedCategory: ICategoryBase = JSON.parse(req.body.category)

            const category = await prisma.categories.create({
                data: {
                    ...readedCategory,
                    user_id: req.user.id
                },
                include: {
                    subcategories: true
                }
            })

            res.status(200).json(category)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
            console.log(error)
        }
    }

    static async save(req: Request, res: Response) {
        try {
            if (!req.body.category) throw new Error('Data not provided')

            let readedCategory: ICategory = JSON.parse(req.body.category)

            const category = await prisma.categories.update({
                where: {
                    id: readedCategory.id
                },
                data: _.omit(readedCategory, ['subcategories'])
            })

            res.status(200).json(category)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            await prisma.subcategories.deleteMany({
                where: {
                    category_id: req.body.id
                }
            })

            await prisma.categories.delete({
                where: {
                    id: req.body.id
                }
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
                },
                include: {
                    subcategories: true
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

            const categories = await prisma.categories.findMany(sql)

            res.status(200).json(categories)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
