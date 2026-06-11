import type { Request, Response } from 'express'
import type { FinancialAccountBalanceData, FinancialAccountData } from '@poveroh/types'
import { BadRequestError, ResponseHelper } from '@/utils'
import { getParamString } from '@/utils/request'
import { parseRequestBody } from '@/utils/validation'
import { CreateFinancialAccountBalanceRequestSchema } from '@poveroh/schemas'
import { AccountBalanceService } from './account-balance.service'

export class AccountBalanceController {
    private readonly accountBalanceService = new AccountBalanceService()

    // POST /balance
    addManualBalance = async (req: Request, res: Response) => {
        try {
            const payload = parseRequestBody(CreateFinancialAccountBalanceRequestSchema, req.body)
            const account = await this.accountBalanceService.addManualBalance(payload)

            return ResponseHelper.success<FinancialAccountData>(res, account)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /:id/balance-series
    getSeries = async (req: Request, res: Response) => {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing financial account ID in path')

            const from = typeof req.query.from === 'string' ? req.query.from : undefined
            const to = typeof req.query.to === 'string' ? req.query.to : undefined

            const series = await this.accountBalanceService.getSeries(id, from, to)

            return ResponseHelper.success<FinancialAccountBalanceData[]>(res, series)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
