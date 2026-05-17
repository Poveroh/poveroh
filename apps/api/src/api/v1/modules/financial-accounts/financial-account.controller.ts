import type { Request, Response } from 'express'
import type { FilterOptions, FinancialAccountData, FinancialAccountFilters } from '@poveroh/types'
import { getParamString } from '@/src/utils/request'
import { BadRequestError, NotFoundError, ResponseHelper } from '@/src/utils'
import { parseRequestBody } from '@/utils/validation'
import { CreateFinancialAccountRequestSchema, UpdateFinancialAccountRequestSchema } from '@poveroh/schemas'
import { FinancialAccountService } from './financial-account.service'

export class FinancialAccountController {
    // Creates a financial account from multipart form data.
    static async createFinancialAccount(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateFinancialAccountRequestSchema, req.body)
            const financialAccountService = new FinancialAccountService()
            const account = await financialAccountService.createFinancialAccount(payload, req.file)

            return ResponseHelper.success<FinancialAccountData>(res, account)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Updates a financial account owned by the current user.
    static async updateFinancialAccount(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing financial account ID in path')

            const payload = parseRequestBody(UpdateFinancialAccountRequestSchema, req.body)
            const financialAccountService = new FinancialAccountService()
            await financialAccountService.updateFinancialAccount(id, payload, req.file)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Soft deletes one financial account.
    static async deleteFinancialAccount(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing financial account ID')

            const financialAccountService = new FinancialAccountService()
            await financialAccountService.deleteFinancialAccount(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Soft deletes every visible financial account for the current user.
    static async deleteAllFinancialAccounts(req: Request, res: Response) {
        try {
            const financialAccountService = new FinancialAccountService()
            await financialAccountService.deleteAllFinancialAccounts()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Reads one financial account by user-scoped id.
    static async readFinancialAccountById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing financial account ID')

            const financialAccountService = new FinancialAccountService()
            const data = await financialAccountService.getFinancialAccountById(id)
            if (!data) throw new NotFoundError('Financial account not found')

            return ResponseHelper.success<FinancialAccountData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Reads financial accounts using existing query shape for OpenAPI compatibility.
    static async readFinancialAccounts(req: Request, res: Response) {
        try {
            const filters = (req.query.filter || {}) as FinancialAccountFilters
            const options = (req.query.options || {}) as FilterOptions
            const skip = isNaN(Number(options.skip)) ? 0 : Number(options.skip)
            const take = isNaN(Number(options.take)) ? 20 : Number(options.take)

            const financialAccountService = new FinancialAccountService()
            const data = await financialAccountService.getFinancialAccounts(filters, skip, take)

            return ResponseHelper.success<FinancialAccountData[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
