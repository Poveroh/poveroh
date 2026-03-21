import { Request, Response } from 'express'
import { getParamString } from '../../../utils/request'
import { CategoryDataResponse, CategoryFilters, CreateCategoryRequest, UpdateCategoryRequest } from '@poveroh/types'
import { BadRequestError, NotFoundError, ResponseHelper } from '@/src/utils'
import { CategoryService } from '../services/category.service'

export class CategoryController {
    //POST /
    static async createCategory(req: Request, res: Response) {
        try {
            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const readCategory: CreateCategoryRequest = req.body

            const categoryService = new CategoryService(req.user.id)
            const category = await categoryService.createCategory(readCategory, req.file)

            if (!category) {
                throw new Error('Failed to create category')
            }

            return ResponseHelper.success<CategoryDataResponse>(res, category)
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

            const categoryService = new CategoryService(req.user.id)
            await categoryService.updateCategory(id, readCategory, req.file)

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

            const categoryService = new CategoryService(req.user.id)
            await categoryService.deleteCategory(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //DELETE
    static async deleteAllCategories(req: Request, res: Response) {
        try {
            const categoryService = new CategoryService(req.user.id)
            await categoryService.deleteAllCategories()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //GET /:id
    static async readCategoryById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing category ID in path')
            }

            const categoryService = new CategoryService(req.user.id)
            const data = await categoryService.getCategoryById(id)

            if (!data) {
                throw new NotFoundError('Category not found')
            }

            return ResponseHelper.success<CategoryDataResponse>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //GET /
    static async readCategories(req: Request, res: Response) {
        try {
            const filters = req.query as CategoryFilters
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const categoryService = new CategoryService(req.user.id)
            const data = await categoryService.getCategories(filters, skip, take)

            if (!data || data.length === 0) {
                throw new NotFoundError('Category not found')
            }

            return ResponseHelper.success<CategoryDataResponse[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
