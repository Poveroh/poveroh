import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { ISubcategory, ISubcategoryBase } from '@poveroh/types'
import _ from 'lodash'

export class SubcategoryController {
    static async add(req: Request, res: Response) {
        try {
            if (!req.body.subcategory) throw new Error('Data not provided')

            let readedCategory: ISubcategoryBase = JSON.parse(req.body.subcategory)

            const subcategory = await prisma.subcategories.create({
                data: readedCategory
            })

            res.status(200).json(subcategory)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
            console.log(error)
        }
    }

    static async save(req: Request, res: Response) {
        try {
            if (!req.body.subcategory) throw new Error('Data not provided')

            let readedSubcategory: ISubcategory = JSON.parse(req.body.subcategory)

            const subcategory = await prisma.subcategories.update({
                where: {
                    id: readedSubcategory.id
                },
                data: readedSubcategory
            })

            res.status(200).json(subcategory)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            await prisma.subcategories.delete({
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

            const subcategories = await prisma.subcategories.findMany(sql)

            res.status(200).json(subcategories)
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
