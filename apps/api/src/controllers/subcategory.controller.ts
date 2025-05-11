import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { ISubcategory, ISubcategoryBase, ISubcategoryFilters } from '@poveroh/types'
import _ from 'lodash'
import { buildWhere } from '../helpers/filter.helper'

export class SubcategoryController {
    static async add(req: Request, res: Response) {
        try {
            if (!req.body.data) throw new Error('Data not provided')

            let readedCategory: ISubcategoryBase = JSON.parse(req.body.data)

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
            if (!req.body.data) throw new Error('Data not provided')

            let readedSubcategory: ISubcategory = JSON.parse(req.body.data)

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
            const filters: ISubcategoryFilters | string[] = req.body
            const where = buildWhere(filters)

            const data = await prisma.subcategories.findMany({
                where,
                orderBy: { created_at: 'desc' }
            })

            res.status(200).json(data)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
