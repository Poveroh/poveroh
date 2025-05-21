import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { ISubcategory, ISubcategoryBase, ISubcategoryFilters } from '@poveroh/types'
import { buildWhere } from '../../../helpers/filter.helper'
import { MediaHelper } from '../../../helpers/media.helper'

export class SubcategoryController {
    //POST /
    static async add(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            const readedSubcategory: ISubcategoryBase = JSON.parse(req.body.data)

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/subcategory/${readedSubcategory.title}`
                )
                readedSubcategory.logo_icon = filePath
            }

            const subcategory = await prisma.subcategories.create({
                data: readedSubcategory
            })

            res.status(200).json(subcategory)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //POST /:id
    static async save(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            const readedSubcategory: ISubcategory = JSON.parse(req.body.data)
            const { id } = req.params

            if (!id) {
                res.status(400).json({ message: 'Missing subcategory ID in path' })
                return
            }

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/subcategory/${readedSubcategory.title}`
                )
                readedSubcategory.logo_icon = filePath
            }

            const subcategory = await prisma.subcategories.update({
                where: { id },
                data: readedSubcategory
            })

            res.status(200).json(subcategory)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //DELETE /:id
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params

            if (!id) {
                res.status(400).json({ message: 'Missing subcategory ID in path' })
                return
            }

            await prisma.subcategories.delete({ where: { id } })

            res.status(200).json(true)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //GET /
    static async read(req: Request, res: Response) {
        try {
            const filters = req.query as unknown as ISubcategoryFilters
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const where = buildWhere(filters)

            const data = await prisma.subcategories.findMany({
                where,
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
