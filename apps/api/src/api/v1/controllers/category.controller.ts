import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import omit from 'lodash/omit'
import { buildWhere } from '../../../helpers/filter.helper'
import { MediaHelper } from '../../../helpers/media.helper'
import { getParamString } from '../../../utils/request'
import { CreateCategoryRequest, UpdateCategoryRequest } from '@poveroh/types/contracts'
import { BadRequestError, ResponseHelper } from '@/src/utils'

export class CategoryController {
    //POST /
    static async addCategory(req: Request, res: Response) {
        try {
            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const readCategory: CreateCategoryRequest = req.body

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/category/${readCategory.title}`
                )
                readCategory.logoIcon = filePath
            }

            const category = await prisma.category.create({
                data: {
                    ...readCategory,
                    userId: req.user.id
                }
            })

            return ResponseHelper.success(res, category)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //PATCH /:id
    static async updateCategory(req: Request, res: Response) {
        try {
            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const readCategory: UpdateCategoryRequest = req.body

            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing category ID in path')
            }

            if (req.file) {
                const filePath = await MediaHelper.handleUpload(
                    req.file,
                    `${req.user.id}/category/${readCategory.title}`
                )
                readCategory.logoIcon = filePath
            }

            const category = await prisma.category.update({
                where: { id },
                data: omit(readCategory, ['subcategories'])
            })

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //DELETE /:id
    static async deleteCategory(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing category ID in path')
            }

            if (id == 'all') {
                await prisma.subcategory.deleteMany({})
                await prisma.category.deleteMany({})
            } else {
                await prisma.subcategory.deleteMany({ where: { categoryId: id } })
                await prisma.category.delete({ where: { id } })
            }

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //GET /
    static async readCategories(req: Request, res: Response) {
        try {
            const filters = req.query as unknown as CategoryFilters
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const where = buildWhere(filters)

            const [data, total] = await Promise.all([
                prisma.category.findMany({
                    where,
                    include: { subcategories: true },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take
                }),
                prisma.category.count({ where })
            ])

            return ResponseHelper.success(res, { data, total })
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
