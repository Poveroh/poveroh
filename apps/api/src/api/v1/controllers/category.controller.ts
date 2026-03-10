import { Request, Response } from 'express'
import { getParamString } from '../../../utils/request'
import { CategoryFilters, CreateCategoryRequest, UpdateCategoryRequest } from '@poveroh/types/contracts'
import { BadRequestError, ResponseHelper } from '@/src/utils'
import { CategoryService } from '../services/category.service'

export class CategoryController {
    //POST /
    static async createCategory(req: Request, res: Response) {
        try {
            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const readCategory: CreateCategoryRequest = req.body
            const category = await CategoryService.createCategory(req.user.id, readCategory, req.file)

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

            await CategoryService.updateCategory(id, req.user.id, readCategory, req.file)

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

            await CategoryService.deleteCategory(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //DELETE
    static async deleteAllCategories(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing category ID in path')
            }

            await CategoryService.deleteAllCategories()

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

            const data = await CategoryService.getCategoryById(id)

            return ResponseHelper.success(res, data)
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

            const data = await CategoryService.getCategories(filters, skip, take)

            return ResponseHelper.success(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
