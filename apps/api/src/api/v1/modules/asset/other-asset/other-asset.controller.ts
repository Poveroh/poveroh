import { BadRequestError, ResponseHelper, getParamString, parseRequestBody } from '@/utils'
import { CreateOtherAssetRequestSchema, UpdateOtherAssetRequestSchema } from '@poveroh/schemas'
import { OtherAssetService } from './other-asset.service'
import type { AssetData } from '@poveroh/types'
import type { Request, Response } from 'express'

export class OtherAssetController {
    private readonly otherAssetService = new OtherAssetService()

    // POST /other
    async createOtherAsset(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateOtherAssetRequestSchema, req.body)

            const asset = await this.otherAssetService.createOtherAsset(payload)

            return ResponseHelper.success<AssetData>(res, asset)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /:id/other
    async updateOtherAsset(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing asset ID in path')

            const payload = parseRequestBody(UpdateOtherAssetRequestSchema, req.body)
            await this.otherAssetService.updateOtherAsset(id, payload)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
