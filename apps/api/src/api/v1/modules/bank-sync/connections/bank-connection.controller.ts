import type { Request, Response } from 'express'
import type { BankSyncConnection, BankSyncProvider } from '@poveroh/types'

import { BadRequestError, ResponseHelper, getParamString, parseRequestBody } from '@/utils'
import { CompleteBankSyncConnectionRequestSchema, CreateBankSyncConnectionRequestSchema } from '@poveroh/schemas'
import { BankConnectionService } from './bank-connection.service'

export class BankConnectionController {
    private readonly connectionService = new BankConnectionService()

    // GET /bank-sync/providers
    async readProviders(req: Request, res: Response) {
        try {
            const providers = await this.connectionService.getProviders()
            return ResponseHelper.success<BankSyncProvider[]>(res, providers)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /bank-sync/connections
    async listConnections(req: Request, res: Response) {
        try {
            const connections = await this.connectionService.listConnections()
            return ResponseHelper.success<BankSyncConnection[]>(res, connections)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // POST /bank-sync/connections
    async createConnection(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateBankSyncConnectionRequestSchema, req.body)
            const result = await this.connectionService.createConnection(payload)
            return ResponseHelper.success(res, result)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // POST /bank-sync/connections/:connectionId/complete
    async completeConnection(req: Request, res: Response) {
        try {
            const connectionId = getParamString(req.params, 'connectionId')
            if (!connectionId) throw new BadRequestError('Missing connection ID in path')

            const payload = parseRequestBody(CompleteBankSyncConnectionRequestSchema, req.body)
            const connection = await this.connectionService.completeConnection(connectionId, payload)

            return ResponseHelper.success<BankSyncConnection>(res, connection)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // POST /bank-sync/connections/:connectionId/sync
    async triggerSync(req: Request, res: Response) {
        try {
            const connectionId = getParamString(req.params, 'connectionId')
            if (!connectionId) throw new BadRequestError('Missing connection ID in path')

            await this.connectionService.triggerSync(connectionId)

            return ResponseHelper.success(res, { success: true })
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /bank-sync/connections/:connectionId
    async deleteConnection(req: Request, res: Response) {
        try {
            const connectionId = getParamString(req.params, 'connectionId')
            if (!connectionId) throw new BadRequestError('Missing connection ID in path')

            await this.connectionService.deleteConnection(connectionId)

            return ResponseHelper.success(res, { success: true })
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
