import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { ICategory, ICategoryBase, ICategoryFilters } from '@poveroh/types'
import { omit } from 'lodash'
import { buildWhere } from '../../../helpers/filter.helper'
import { MediaHelper } from '../../../helpers/media.helper'

export class CategoryController {
    //POST /
    static async add(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            const readedCategory: ICategoryBase = JSON.parse(req.body.data)

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/category/${readedCategory.title}`
                )
                readedCategory.logo_icon = filePath
            }

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
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //POST /:id
    static async save(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            const readedCategory: ICategory = JSON.parse(req.body.data)
            const { id } = req.params

            if (!id) {
                res.status(400).json({ message: 'Missing category ID in path' })
                return
            }

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/category/${readedCategory.title}`
                )
                readedCategory.logo_icon = filePath
            }

            const category = await prisma.categories.update({
                where: { id },
                data: omit(readedCategory, ['subcategories'])
            })

            res.status(200).json(category)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //DELETE /:id
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params

            if (!id) {
                res.status(400).json({ message: 'Missing category ID in path' })
                return
            }

            await prisma.subcategories.deleteMany({ where: { category_id: id } })
            await prisma.categories.delete({ where: { id } })

            res.status(200).json(true)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //GET /
    static async read(req: Request, res: Response) {
        try {
            const filters = req.query as unknown as ICategoryFilters
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const where = buildWhere(filters)

            const data = await prisma.categories.findMany({
                where,
                include: { subcategories: true },
                orderBy: { created_at: 'desc' },
                skip,
                take
            })

            res.status(200).json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
