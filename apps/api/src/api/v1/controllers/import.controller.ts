import { Request, Response } from 'express'
import { CreateImportRequest, ImportFilters, TransactionFilters, UpdateImportRequest } from '@poveroh/types/contracts'
import { getParamString } from '../../../utils/request'
import { BadRequestError, NotFoundError, ResponseHelper } from '@/src/utils'
import { ImportService } from '../services/import.service'

export class ImportController {
    //POST /
    static async createImport(req: Request, res: Response) {
        try {
            try {
                if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                    throw new BadRequestError('No files provided')
                }

                const files = req.files as Express.Multer.File[]
                const payload = req.body as CreateImportRequest
                if (!payload.financialAccountId) {
                    throw new BadRequestError('Missing financialAccountId')
                }

                const importService = new ImportService(req.user.id)
                const data = await importService.createImport(payload, files)

                return ResponseHelper.success(res, data)
            } catch (error) {
                return ResponseHelper.handleError(res, error)
            }
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //PUT /:id
    static async updateImport(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing import ID')
            }

            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const payload = req.body as UpdateImportRequest

            const importService = new ImportService(req.user.id)
            const data = await importService.updateImport(id, payload)

            return ResponseHelper.success(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //PATCH /complete/:id
    static async completeImport(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing import ID')
            }

            const importService = new ImportService(req.user.id)
            const imports = await importService.completeImport(id)

            return ResponseHelper.success(res, imports)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //DELETE /:id
    static async deleteImport(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing import ID')
            }

            const importService = new ImportService(req.user.id)
            await importService.deleteImport(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //DELETE /
    static async deleteAllImports(req: Request, res: Response) {
        try {
            const importService = new ImportService(req.user.id)
            await importService.deleteAllImports()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //GET /
    static async readImports(req: Request, res: Response) {
        try {
            const filters = req.query as unknown as ImportFilters
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const importService = new ImportService(req.user.id)
            const data = await importService.getImports(filters, skip, take)

            return ResponseHelper.success(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //GET /:id
    static async readImportById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing import ID')
            }

            const importService = new ImportService(req.user.id)
            const data = await importService.getImportById(id)

            if (!data) {
                throw new NotFoundError('Import not found')
            }
            return ResponseHelper.success(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //POST /template
    static async importTemplates(req: Request, res: Response) {
        try {
            const { action } = req.body

            if (!action) {
                throw new BadRequestError('Invalid action for template import')
            }

            const importService = new ImportService(req.user.id)
            const result = await importService.importTemplates(action)

            if (!result) {
                throw new BadRequestError('Invalid action for template import')
            }

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
