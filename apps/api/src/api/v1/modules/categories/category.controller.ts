import { CreateCategoryRequestSchema, UpdateCategoryRequestSchema } from '@poveroh/schemas'
import { BadRequestError, NotFoundError, ResponseHelper, getParamString, parseRequestBody } from '@/utils'
import type { CategoryData, CategoryFilters } from '@poveroh/types'
import { CategoryService } from './category.service'
import type { Request, Response } from 'express'

export class CategoryController {
    private readonly categoryService = new CategoryService()

    // POST /
    async createCategory(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateCategoryRequestSchema, req.body)

            const category = await this.categoryService.createCategory(payload, req.file)

            return ResponseHelper.success<CategoryData>(res, category)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /:id
    async updateCategory(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing category ID in path')

            const payload = parseRequestBody(UpdateCategoryRequestSchema, req.body)
            await this.categoryService.updateCategory(id, payload, req.file)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /:id
    async deleteCategory(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing category ID in path')

            await this.categoryService.deleteCategory(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /
    async deleteAllCategories(req: Request, res: Response) {
        try {
            await this.categoryService.deleteAllCategories()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /:id
    async readCategoryById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing category ID in path')

            const data = await this.categoryService.getCategoryById(id)
            if (!data) throw new NotFoundError('Category not found')

            return ResponseHelper.success<CategoryData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /
    async readCategories(req: Request, res: Response) {
        try {
            const filters = req.query as CategoryFilters
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const data = await this.categoryService.getCategories(filters, skip, take)

            return ResponseHelper.success<CategoryData[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
