import { Request, Response } from 'express'
import {
    CreateSubcategoryRequest,
    SubcategoryDataResponse,
    SubcategoryFilters,
    UpdateSubcategoryRequest
} from '@poveroh/types'
import { getParamString } from '../../../utils/request'
import { BadRequestError, NotFoundError, ResponseHelper } from '@/src/utils'
import { SubcategoryService } from '../services/subcategory.service'

export class SubcategoryController {
    //POST /
    static async createSubcategory(req: Request, res: Response) {
        try {
            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const subcategoryPayload: CreateSubcategoryRequest = req.body

            const subcategoryService = new SubcategoryService(req.user.id)
            const subcategory = await subcategoryService.createSubcategory(subcategoryPayload, req.file)

            if (!subcategory) {
                throw new Error('Failed to create subcategory')
            }

            return ResponseHelper.success(res, subcategory)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //PATCH /:id
    static async updateSubcategory(req: Request, res: Response) {
        try {
            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const subcategoryPayload: UpdateSubcategoryRequest = req.body
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing subcategory ID in path')
            }

            const subcategoryService = new SubcategoryService(req.user.id)
            await subcategoryService.updateSubcategory(id, subcategoryPayload, req.file)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //DELETE /:id
    static async deleteSubcategory(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing subcategory ID in path')
            }

            const subcategoryService = new SubcategoryService(req.user.id)
            await subcategoryService.deleteSubcategory(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //DELETE /
    static async deleteAllSubcategories(req: Request, res: Response) {
        try {
            const subcategoryService = new SubcategoryService(req.user.id)
            await subcategoryService.deleteAllSubcategories()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //GET /:id
    static async readSubcategoryById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing subcategory ID in path')
            }

            const subcategoryService = new SubcategoryService(req.user.id)
            const data = await subcategoryService.getSubcategoryById(id)

            if (!data) {
                throw new NotFoundError('Subcategory not found')
            }

            return ResponseHelper.success<SubcategoryDataResponse>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //GET /
    static async readSubcategories(req: Request, res: Response) {
        try {
            const filters = req.query as unknown as SubcategoryFilters
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const subcategoryService = new SubcategoryService(req.user.id)
            const data = await subcategoryService.getSubcategories(filters, skip, take)

            if (!data || data.length === 0) {
                throw new NotFoundError('Subcategory not found')
            }

            return ResponseHelper.success<SubcategoryDataResponse[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
