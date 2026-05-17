import type { Request, Response } from 'express'
import type { AssetData, CreateMarketableAssetRequest, UpdateMarketableAssetRequest } from '@poveroh/types'
import { getParamString } from '../../../utils/request'
import { BadRequestError, ResponseHelper } from '@/src/utils'
import { MarketableAssetService } from '../services/marketable-asset.service'

export class MarketableAssetController {
    // POST /marketable
    static async createMarketableAsset(req: Request, res: Response) {
        try {
            const payload: CreateMarketableAssetRequest = JSON.parse(req.body.data)

            const marketableAssetService = new MarketableAssetService(req.user.id)
            const asset = await marketableAssetService.createMarketableAsset(payload)

            return ResponseHelper.success<AssetData>(res, asset)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /:id/marketable
    static async updateMarketableAsset(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) {
                throw new BadRequestError('Missing asset ID in path')
            }

            const payload: UpdateMarketableAssetRequest = JSON.parse(req.body.data)

            const marketableAssetService = new MarketableAssetService(req.user.id)
            await marketableAssetService.updateMarketableAsset(id, payload)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
