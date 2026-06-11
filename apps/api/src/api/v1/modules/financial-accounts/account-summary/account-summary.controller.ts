import type { Request, Response } from 'express'
import type { AccountSummaryData } from '@poveroh/types'
import { BadRequestError, ResponseHelper } from '@/utils'
import { getParamString } from '@/utils/request'
import { AccountSummaryService } from './account-summary.service'

export class AccountSummaryController {
    private readonly accountSummaryService = new AccountSummaryService()

    // GET /:id/summary
    getSummary = async (req: Request, res: Response) => {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing financial account ID in path')

            const from = typeof req.query.from === 'string' ? req.query.from : undefined
            const to = typeof req.query.to === 'string' ? req.query.to : undefined

            const summary = await this.accountSummaryService.getSummary(id, from, to)

            return ResponseHelper.success<AccountSummaryData>(res, summary)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
