import { BadRequestError, ResponseHelper, getParamString, parseRequestBody } from '@/utils'
import { CollectibleAssetService } from './collectible-asset.service'
import { CreateCollectibleAssetRequestSchema, UpdateCollectibleAssetRequestSchema } from '@poveroh/schemas'
import type { AssetData } from '@poveroh/types'
import type { Request, Response } from 'express'

export class CollectibleAssetController {
    private readonly collectibleAssetService = new CollectibleAssetService()

    // POST /collectible
    async createCollectibleAsset(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateCollectibleAssetRequestSchema, req.body)

            const asset = await this.collectibleAssetService.createCollectibleAsset(payload)

            return ResponseHelper.success<AssetData>(res, asset)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /:id/collectible
    async updateCollectibleAsset(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing asset ID in path')

            const payload = parseRequestBody(UpdateCollectibleAssetRequestSchema, req.body)
            await this.collectibleAssetService.updateCollectibleAsset(id, payload)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
