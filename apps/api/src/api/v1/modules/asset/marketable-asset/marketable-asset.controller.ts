import { BadRequestError, ResponseHelper, getParamString, parseRequestBody } from '@/utils'
import { CreateMarketableAssetRequestSchema, UpdateMarketableAssetRequestSchema } from '@poveroh/schemas'
import { MarketableAssetService } from './marketable-asset.service'
import type { AssetData } from '@poveroh/types'
import type { Request, Response } from 'express'

export class MarketableAssetController {
    private readonly marketableAssetService = new MarketableAssetService()

    // POST /marketable
    async createMarketableAsset(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateMarketableAssetRequestSchema, req.body)

            const asset = await this.marketableAssetService.createMarketableAsset(payload)

            return ResponseHelper.success<AssetData>(res, asset)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /:id/marketable
    async updateMarketableAsset(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing asset ID in path')

            const payload = parseRequestBody(UpdateMarketableAssetRequestSchema, req.body)
            await this.marketableAssetService.updateMarketableAsset(id, payload)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
