import { Request, Response } from 'express'
import {
    CreateFinancialAccountRequest,
    FinancialAccountData,
    FinancialAccountFilters,
    UpdateFinancialAccountRequest
} from '@poveroh/types'
import { getParamString } from '../../../utils/request'
import { BadRequestError, NotFoundError, ResponseHelper } from '@/src/utils'
import { FinancialAccountService } from '../services/financial-account.service'

export class FinancialAccountController {
    //POST /
    static async createFinancialAccount(req: Request, res: Response) {
        try {
            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const readFinancialAccount: CreateFinancialAccountRequest = req.body

            const financialAccountService = new FinancialAccountService(req.user.id)
            const account = await financialAccountService.createFinancialAccount(readFinancialAccount, req.file)

            return ResponseHelper.success<FinancialAccountData>(res, account)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //PATCH /:id
    static async updateFinancialAccount(req: Request, res: Response) {
        try {
            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const readFinancialAccount: UpdateFinancialAccountRequest = req.body
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing financial account ID in path')
            }

            const financialAccountService = new FinancialAccountService(req.user.id)
            await financialAccountService.updateFinancialAccount(id, readFinancialAccount, req.file)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //DELETE /:id
    static async deleteFinancialAccount(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing financial account ID')
            }

            const financialAccountService = new FinancialAccountService(req.user.id)
            await financialAccountService.deleteFinancialAccount(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //DELETE
    static async deleteAllFinancialAccounts(req: Request, res: Response) {
        try {
            const financialAccountService = new FinancialAccountService(req.user.id)
            await financialAccountService.deleteAllFinancialAccounts()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //GET /:id
    static async readFinancialAccountById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing financial account ID')
            }

            const financialAccountService = new FinancialAccountService(req.user.id)
            const data = await financialAccountService.getFinancialAccountById(id)

            if (!data) {
                throw new NotFoundError('Financial account not found')
            }

            return ResponseHelper.success<FinancialAccountData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //GET /
    static async readFinancialAccounts(req: Request, res: Response) {
        try {
            const filters = (req.query.filter || {}) as FinancialAccountFilters
            const options = (req.query.options || {}) as any
            const skip = isNaN(Number(options.skip)) ? 0 : Number(options.skip)
            const take = isNaN(Number(options.take)) ? 20 : Number(options.take)

            const financialAccountService = new FinancialAccountService(req.user.id)
            const data = await financialAccountService.getFinancialAccounts(filters, skip, take)

            if (!data || data.length === 0) {
                throw new NotFoundError('Financial accounts not found')
            }

            return ResponseHelper.success<FinancialAccountData[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
