import type { Request, Response } from 'express'
import type { SubcategoryData, SubcategoryFilters } from '@poveroh/types'
import { getParamString } from '@/src/utils/request'
import { BadRequestError, NotFoundError, ResponseHelper } from '@/src/utils'
import { parseRequestBody } from '@/utils/validation'
import { CreateSubcategoryRequestSchema, UpdateSubcategoryRequestSchema } from '@poveroh/schemas'
import { SubcategoryService } from './subcategory.service'

export class SubcategoryController {
    // Creates a subcategory from validated request data.
    static async createSubcategory(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateSubcategoryRequestSchema, req.body)
            const subcategoryService = new SubcategoryService()
            const subcategory = await subcategoryService.createSubcategory(payload, req.file)

            return ResponseHelper.success(res, subcategory)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Updates a subcategory owned through the current user's category.
    static async updateSubcategory(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing subcategory ID in path')

            const payload = parseRequestBody(UpdateSubcategoryRequestSchema, req.body)
            const subcategoryService = new SubcategoryService()
            await subcategoryService.updateSubcategory(id, payload, req.file)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Soft-deletes one subcategory.
    static async deleteSubcategory(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing subcategory ID in path')

            const subcategoryService = new SubcategoryService()
            await subcategoryService.deleteSubcategory(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Soft-deletes every subcategory owned by the current user.
    static async deleteAllSubcategories(req: Request, res: Response) {
        try {
            const subcategoryService = new SubcategoryService()
            await subcategoryService.deleteAllSubcategories()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Reads one subcategory by user-scoped id.
    static async readSubcategoryById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing subcategory ID in path')

            const subcategoryService = new SubcategoryService()
            const data = await subcategoryService.getSubcategoryById(id)
            if (!data) throw new NotFoundError('Subcategory not found')

            return ResponseHelper.success<SubcategoryData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Reads subcategories using the existing query shape.
    static async readSubcategories(req: Request, res: Response) {
        try {
            const filters = req.query as unknown as SubcategoryFilters
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const subcategoryService = new SubcategoryService()
            const data = await subcategoryService.getSubcategories(filters, skip, take)

            if (!data || data.length === 0) throw new NotFoundError('Subcategory not found')

            return ResponseHelper.success<SubcategoryData[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
