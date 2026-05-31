import type { Request, Response } from 'express'

import { BadRequestError, ResponseHelper, getParamString, parseRequestBody } from '@/utils'
import { UpdateMarketDataProviderCredentialRequestSchema } from '@poveroh/schemas'
import { MarketDataCredentialService } from './market-data-credential.service'

export class MarketDataCredentialController {
    private readonly credentialService = new MarketDataCredentialService()

    // PUT /providers/:providerId/credential
    async saveProviderCredential(req: Request, res: Response) {
        try {
            const providerId = getParamString(req.params, 'providerId')
            if (!providerId) throw new BadRequestError('Missing provider ID in path')

            const payload = parseRequestBody(UpdateMarketDataProviderCredentialRequestSchema, req.body)
            await this.credentialService.saveCredential(providerId, payload)

            return ResponseHelper.success(res, { success: true })
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /providers/:providerId/credential
    async deleteProviderCredential(req: Request, res: Response) {
        try {
            const providerId = getParamString(req.params, 'providerId')
            if (!providerId) throw new BadRequestError('Missing provider ID in path')

            await this.credentialService.deleteCredential(providerId)

            return ResponseHelper.success(res, { success: true })
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
