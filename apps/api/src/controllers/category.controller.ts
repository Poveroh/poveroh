import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { ICategory, ICategoryBase, ICategoryFilters } from '@poveroh/types'
import _ from 'lodash'
import { buildWhere } from '../helpers/filter.helper'

export class CategoryController {
    static async add(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            let readedCategory: ICategoryBase = JSON.parse(req.body.data)

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
            if (!req.body.data) throw new Error('Data not provided')

            let readedCategory: ICategory = JSON.parse(req.body.data)

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
            const { id } = req.params

            await prisma.subcategories.deleteMany({
                where: {
                    category_id: id
                }
            })

            await prisma.categories.delete({
                where: {
                    id: id
                }
            })

            res.status(200).json(true)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async read(req: Request, res: Response) {
        try {
            const filters: ICategoryFilters | string[] = req.body
            const where = buildWhere(filters)

            const data = await prisma.categories.findMany({
                where,
                include: { subcategories: true },
                orderBy: { created_at: 'desc' }
            })

            res.status(200).json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
