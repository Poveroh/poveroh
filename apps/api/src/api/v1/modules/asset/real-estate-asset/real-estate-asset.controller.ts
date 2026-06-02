import { BadRequestError, ResponseHelper, getParamString, parseRequestBody } from '@/utils'
import { CreateRealEstateAssetRequestSchema, UpdateRealEstateAssetRequestSchema } from '@poveroh/schemas'
import { RealEstateAssetService } from './real-estate-asset.service'
import type { AssetData } from '@poveroh/types'
import type { Request, Response } from 'express'

export class RealEstateAssetController {
    private readonly realEstateAssetService = new RealEstateAssetService()

    // POST /real-estate
    async createRealEstateAsset(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateRealEstateAssetRequestSchema, req.body)

            const asset = await this.realEstateAssetService.createRealEstateAsset(payload)

            return ResponseHelper.success<AssetData>(res, asset)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /:id/real-estate
    async updateRealEstateAsset(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing asset ID in path')

            const payload = parseRequestBody(UpdateRealEstateAssetRequestSchema, req.body)
            await this.realEstateAssetService.updateRealEstateAsset(id, payload)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
