import type { Request, Response } from 'express'
import type { FilterOptions, ImportData, ImportFilters, ImportTransactionDataResponse } from '@poveroh/types'
import {
    ApproveImportTransactionsRequestSchema,
    CreateImportRequestSchema,
    UpdateImportRequestSchema
} from '@poveroh/schemas'
import { ImportService } from './import.service'
import { BadRequestError, parseRequestBody, ResponseHelper, getParamString, NotFoundError } from '@/utils'

export class ImportController {
    private readonly importService = new ImportService()

    // POST /
    async createImport(req: Request, res: Response) {
        try {
            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                throw new BadRequestError('No files provided')
            }

            const files = req.files as Express.Multer.File[]
            const payload = parseRequestBody(CreateImportRequestSchema, req.body)

            const data = await this.importService.createImport(payload, files)

            return ResponseHelper.success<ImportData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PUT /:id
    async updateImport(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing import ID')

            const payload = parseRequestBody(UpdateImportRequestSchema, req.body)
            const data = await this.importService.updateImport(id, payload)

            return ResponseHelper.success<ImportData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /complete/:id
    async completeImport(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing import ID')

            const data = await this.importService.completeImport(id)

            return ResponseHelper.success<ImportData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /rollback/:id
    async rollbackImport(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing import ID')

            const exist = await this.importService.doesImportExist(id)
            if (!exist) throw new NotFoundError('Import not found')

            const data = await this.importService.rollbackImport(id)

            return ResponseHelper.success<ImportData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /:id/transactions/approve
    async approveImportTransactions(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing import ID')

            const payload = parseRequestBody(ApproveImportTransactionsRequestSchema, req.body)
            const data = await this.importService.approveImportTransactions(id, payload)

            return ResponseHelper.success<ImportTransactionDataResponse[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /:id
    async deleteImport(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing import ID')

            await this.importService.deleteImport(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /
    async deleteAllImports(req: Request, res: Response) {
        try {
            await this.importService.deleteAllImports()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /
    async readImports(req: Request, res: Response) {
        try {
            const filters = (req.query.filter || {}) as ImportFilters
            const options = (req.query.options || {}) as FilterOptions
            const skip = isNaN(Number(options.skip)) ? 0 : Number(options.skip)
            const take = isNaN(Number(options.take)) ? 20 : Number(options.take)

            const data = await this.importService.getImports(filters, skip, take)

            return ResponseHelper.success<ImportData[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /:id
    async readImportById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing import ID')

            const data = await this.importService.getImportById(id)
            if (!data) throw new NotFoundError('Import not found')

            return ResponseHelper.success<ImportData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /:id/transactions
    async readImportTransactions(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing import ID')

            const data = await this.importService.getImportTransactions(id)

            return ResponseHelper.success<ImportTransactionDataResponse[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // POST /template/:action
    async importTemplates(req: Request, res: Response) {
        try {
            const action = getParamString(req.params, 'action')
            if (!action) throw new BadRequestError('Invalid action for template import')

            const result = await this.importService.importTemplates(action)
            if (!result) throw new BadRequestError('Invalid action for template import')

            return ResponseHelper.success(res, result)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
