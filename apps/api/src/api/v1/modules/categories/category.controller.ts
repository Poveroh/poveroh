import { CreateCategoryRequestSchema, UpdateCategoryRequestSchema } from '@poveroh/schemas'
import { BadRequestError, NotFoundError, ResponseHelper, getParamString } from '@/utils'
import type { CategoryData, CategoryFilters } from '@poveroh/types'
import { CategoryService } from './category.service'
import type { Request, Response } from 'express'
import { parseRequestBody } from '@/utils/validation'

export class CategoryController {
    private static readonly service = new CategoryService()

    // POST /
    static async createCategory(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateCategoryRequestSchema, req.body)

            const category = await this.service.createCategory(payload, req.file)

            return ResponseHelper.success<CategoryData>(res, category)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /:id
    static async updateCategory(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing category ID in path')

            const payload = parseRequestBody(UpdateCategoryRequestSchema, req.body)
            await this.service.updateCategory(id, payload, req.file)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /:id
    static async deleteCategory(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing category ID in path')

            await this.service.deleteCategory(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /
    static async deleteAllCategories(req: Request, res: Response) {
        try {
            await this.service.deleteAllCategories()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /:id
    static async readCategoryById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing category ID in path')

            const data = await this.service.getCategoryById(id)
            if (!data) throw new NotFoundError('Category not found')

            return ResponseHelper.success<CategoryData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /
    static async readCategories(req: Request, res: Response) {
        try {
            const filters = req.query as CategoryFilters
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const data = await this.service.getCategories(filters, skip, take)

            return ResponseHelper.success<CategoryData[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
