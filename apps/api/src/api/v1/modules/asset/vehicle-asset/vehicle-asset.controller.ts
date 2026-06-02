import { BadRequestError, ResponseHelper, getParamString, parseRequestBody } from '@/utils'
import { CreateVehicleAssetRequestSchema, UpdateVehicleAssetRequestSchema } from '@poveroh/schemas'
import { VehicleAssetService } from './vehicle-asset.service'
import type { AssetData } from '@poveroh/types'
import type { Request, Response } from 'express'

export class VehicleAssetController {
    private readonly vehicleAssetService = new VehicleAssetService()

    // POST /vehicle
    async createVehicleAsset(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateVehicleAssetRequestSchema, req.body)

            const asset = await this.vehicleAssetService.createVehicleAsset(payload, req.file)

            return ResponseHelper.success<AssetData>(res, asset)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /:id/vehicle
    async updateVehicleAsset(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing asset ID in path')

            const payload = parseRequestBody(UpdateVehicleAssetRequestSchema, req.body)
            await this.vehicleAssetService.updateVehicleAsset(id, payload, req.file)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
