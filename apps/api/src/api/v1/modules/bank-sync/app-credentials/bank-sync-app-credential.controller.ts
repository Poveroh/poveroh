import type { Request, Response } from 'express'

import { BadRequestError, ResponseHelper, getParamString, parseRequestBody } from '@/utils'
import { UpdateBankSyncProviderAppCredentialRequestSchema } from '@poveroh/schemas'
import { BankSyncAppCredentialService } from './bank-sync-app-credential.service'

export class BankSyncAppCredentialController {
    private readonly appCredentialService = new BankSyncAppCredentialService()

    // PUT /bank-sync/providers/:providerId/app-credential
    async saveProviderAppCredential(req: Request, res: Response) {
        try {
            const providerId = getParamString(req.params, 'providerId')
            if (!providerId) throw new BadRequestError('Missing provider ID in path')

            const payload = parseRequestBody(UpdateBankSyncProviderAppCredentialRequestSchema, req.body)
            await this.appCredentialService.saveCredential(providerId, payload.credentials)

            return ResponseHelper.success(res, { success: true })
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /bank-sync/providers/:providerId/app-credential
    async deleteProviderAppCredential(req: Request, res: Response) {
        try {
            const providerId = getParamString(req.params, 'providerId')
            if (!providerId) throw new BadRequestError('Missing provider ID in path')

            await this.appCredentialService.deleteCredential(providerId)

            return ResponseHelper.success(res, { success: true })
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
