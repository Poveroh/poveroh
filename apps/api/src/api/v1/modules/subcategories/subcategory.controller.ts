import type { Request, Response } from 'express'
import type { SubcategoryData, SubcategoryFilters } from '@poveroh/types'
import { CreateSubcategoryRequestSchema, UpdateSubcategoryRequestSchema } from '@poveroh/schemas'
import { SubcategoryService } from './subcategory.service'
import { parseRequestBody, ResponseHelper, getParamString, BadRequestError, NotFoundError } from '@/utils'

export class SubcategoryController {
    private readonly subcategoryService = new SubcategoryService()

    // POST /
    async createSubcategory(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateSubcategoryRequestSchema, req.body)
            const subcategory = await this.subcategoryService.createSubcategory(payload, req.file)

            return ResponseHelper.success<SubcategoryData>(res, subcategory)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /:id
    async updateSubcategory(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing subcategory ID in path')

            const payload = parseRequestBody(UpdateSubcategoryRequestSchema, req.body)
            await this.subcategoryService.updateSubcategory(id, payload, req.file)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /:id
    async deleteSubcategory(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing subcategory ID in path')

            await this.subcategoryService.deleteSubcategory(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /
    async deleteAllSubcategories(req: Request, res: Response) {
        try {
            await this.subcategoryService.deleteAllSubcategories()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /:id
    async readSubcategoryById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing subcategory ID in path')

            const data = await this.subcategoryService.getSubcategoryById(id)
            if (!data) throw new NotFoundError('Subcategory not found')

            return ResponseHelper.success<SubcategoryData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /
    async readSubcategories(req: Request, res: Response) {
        try {
            const filters = req.query as unknown as SubcategoryFilters
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const data = await this.subcategoryService.getSubcategories(filters, skip, take)

            return ResponseHelper.success<SubcategoryData[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
