import type { Request, Response } from 'express'
import { parseBankSyncWebhook } from '@poveroh/bank-sync'
import { ResponseHelper, getParamString } from '@/utils'
import { isKnownBankSyncProvider } from '@/v1/content/template/bank-sync-providers'
import { getJobDispatcher } from '@/utils/queue'
import { BankConnectionService } from '../connections/bank-connection.service'
import { flattenHeaders } from '@/utils/header'

export class BankSyncWebhookController {
    private readonly connectionService = new BankConnectionService()

    // POST /bank-sync/webhooks/:providerId — provider-facing, no session; always acks 200 so
    // providers don't retry-storm on events we simply don't recognize or can't map to a connection.
    async handleWebhook(req: Request, res: Response) {
        try {
            const providerId = getParamString(req.params, 'providerId')
            if (!providerId || !isKnownBankSyncProvider(providerId)) {
                return ResponseHelper.success(res, { success: true })
            }

            const event = parseBankSyncWebhook(providerId, req.body, flattenHeaders(req.headers))
            if (!event) return ResponseHelper.success(res, { success: true })

            const match = await this.connectionService.findConnectionForWebhook(providerId, event.externalConnectionId)
            if (!match) return ResponseHelper.success(res, { success: true })

            await getJobDispatcher().dispatch('bank-sync.sync-connection', {
                userId: match.userId,
                connectionId: match.id,
                trigger: 'WEBHOOK'
            })

            return ResponseHelper.success(res, { success: true })
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
