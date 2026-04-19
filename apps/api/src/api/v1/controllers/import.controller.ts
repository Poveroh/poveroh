import { Request, Response } from 'express'
import {
    ApproveImportTransactionsRequest,
    CreateImportRequest,
    FilterOptions,
    ImportFilters,
    UpdateImportRequest
} from '@poveroh/types'
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
                const payload: CreateImportRequest = JSON.parse(req.body.data)

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

            const payload: UpdateImportRequest = JSON.parse(req.body.data)

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

    //PATCH /rollback/:id
    static async rollbackImport(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing import ID')
            }

            const importService = new ImportService(req.user.id)

            const exist = await importService.doesImportExist(id)
            if (!exist) {
                throw new NotFoundError('Import not found')
            }

            const data = await importService.rollbackImport(id)

            return ResponseHelper.success(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //PATCH /:id/transactions/approve
    static async approveImportTransactions(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing import ID')
            }

            const payload: ApproveImportTransactionsRequest = req.body

            const importService = new ImportService(req.user.id)
            const data = await importService.approveImportTransactions(id, payload)

            return ResponseHelper.success(res, data)
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
            const filters = (req.query.filter || {}) as ImportFilters
            const options = (req.query.options || {}) as FilterOptions
            const skip = isNaN(Number(options.skip)) ? 0 : Number(options.skip)
            const take = isNaN(Number(options.take)) ? 20 : Number(options.take)

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

    //GET /:id/transactions
    static async readImportTransactions(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing import ID')
            }

            const importService = new ImportService(req.user.id)
            const data = await importService.getImportTransactions(id)

            return ResponseHelper.success(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //POST /template
    static async importTemplates(req: Request, res: Response) {
        try {
            const action = getParamString(req.params, 'action')

            if (!action) {
                throw new BadRequestError('Invalid action for template import')
            }

            const importService = new ImportService(req.user.id)
            const result = await importService.importTemplates(action)

            if (!result) {
                throw new BadRequestError('Invalid action for template import')
            }

            return ResponseHelper.success(res, result)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
