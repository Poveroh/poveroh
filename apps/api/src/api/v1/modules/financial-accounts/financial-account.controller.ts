import type { Request, Response } from 'express'
import type { FilterOptions, FinancialAccountData, FinancialAccountFilters } from '@poveroh/types'
import { getParamString } from '@/utils/request'
import { BadRequestError, NotFoundError, ResponseHelper } from '@/utils'
import { parseRequestBody } from '@/utils/validation'
import { CreateFinancialAccountRequestSchema, UpdateFinancialAccountRequestSchema } from '@poveroh/schemas'
import { FinancialAccountService } from './financial-account.service'

export class FinancialAccountController {
    private readonly financialAccountService = new FinancialAccountService()

    // POST /
    createFinancialAccount = async (req: Request, res: Response) => {
        try {
            const payload = parseRequestBody(CreateFinancialAccountRequestSchema, req.body)
            const account = await this.financialAccountService.createFinancialAccount(payload, req.file)

            return ResponseHelper.success<FinancialAccountData>(res, account)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /:id
    updateFinancialAccount = async (req: Request, res: Response) => {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing financial account ID in path')

            const payload = parseRequestBody(UpdateFinancialAccountRequestSchema, req.body)
            await this.financialAccountService.updateFinancialAccount(id, payload, req.file)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /:id
    async deleteFinancialAccount(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing financial account ID')

            await this.financialAccountService.deleteFinancialAccount(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /
    async deleteAllFinancialAccounts(req: Request, res: Response) {
        try {
            await this.financialAccountService.deleteAllFinancialAccounts()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /:id
    async readFinancialAccountById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing financial account ID')

            const data = await this.financialAccountService.getFinancialAccountById(id)
            if (!data) throw new NotFoundError('Financial account not found')

            return ResponseHelper.success<FinancialAccountData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /
    async readFinancialAccounts(req: Request, res: Response) {
        try {
            const filters = (req.query.filter || {}) as FinancialAccountFilters
            const options = (req.query.options || {}) as FilterOptions
            const skip = isNaN(Number(options.skip)) ? 0 : Number(options.skip)
            const take = isNaN(Number(options.take)) ? 20 : Number(options.take)

            const data = await this.financialAccountService.getFinancialAccounts(filters, skip, take)

            return ResponseHelper.success<FinancialAccountData[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
