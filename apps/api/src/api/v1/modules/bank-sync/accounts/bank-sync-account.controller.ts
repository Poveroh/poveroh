import type { Request, Response } from 'express'
import type { BankSyncAccount, ExternalBankAccount } from '@poveroh/types'

import { BadRequestError, ResponseHelper, getParamString, parseRequestBody } from '@/utils'
import { LinkBankSyncAccountsRequestSchema } from '@poveroh/schemas'
import { BankSyncAccountService } from './bank-sync-account.service'

export class BankSyncAccountController {
    private readonly accountService = new BankSyncAccountService()

    // GET /bank-sync/connections/:connectionId/accounts
    async listExternalAccounts(req: Request, res: Response) {
        try {
            const connectionId = getParamString(req.params, 'connectionId')
            if (!connectionId) throw new BadRequestError('Missing connection ID in path')

            const accounts = await this.accountService.listExternalAccounts(connectionId)

            return ResponseHelper.success<ExternalBankAccount[]>(res, accounts)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // POST /bank-sync/connections/:connectionId/accounts
    async linkAccounts(req: Request, res: Response) {
        try {
            const connectionId = getParamString(req.params, 'connectionId')
            if (!connectionId) throw new BadRequestError('Missing connection ID in path')

            const payload = parseRequestBody(LinkBankSyncAccountsRequestSchema, req.body)
            const accounts = await this.accountService.linkAccounts(connectionId, payload.mappings)

            return ResponseHelper.success<BankSyncAccount[]>(res, accounts)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
