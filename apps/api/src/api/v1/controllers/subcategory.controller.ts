import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { ISubcategory, ISubcategoryFilters } from '@poveroh/types'
import { buildWhere } from '../../../helpers/filter.helper'
import { MediaHelper } from '../../../helpers/media.helper'
import logger from '../../../utils/logger'
import { getParamString } from '../../../utils/request'

export class SubcategoryController {
    //POST /
    static async add(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            const readedSubcategory: Omit<ISubcategory, 'id' | 'createdAt'> = JSON.parse(req.body.data)

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/subcategory/${readedSubcategory.title}`
                )
                readedSubcategory.logoIcon = filePath
            }

            const subcategory = await prisma.subcategory.create({
                data: readedSubcategory
            })

            res.status(200).json(subcategory)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //POST /:id
    static async save(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            const readedSubcategory: ISubcategory = JSON.parse(req.body.data)
            const id = getParamString(req.params, 'id')

            if (!id) {
                res.status(400).json({ message: 'Missing subcategory ID in path' })
                return
            }

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/subcategory/${readedSubcategory.title}`
                )
                readedSubcategory.logoIcon = filePath
            }

            const subcategory = await prisma.subcategory.update({
                where: { id },
                data: readedSubcategory
            })

            res.status(200).json(subcategory)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //DELETE /:id
    static async delete(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                res.status(400).json({ message: 'Missing subcategory ID in path' })
                return
            }

            await prisma.subcategory.delete({ where: { id } })

            res.status(200).json(true)
        } catch (error) {
            logger.error(error)
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

            const data = await prisma.subcategory.findMany({
                where,
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
