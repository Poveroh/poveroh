import { AssetService } from './asset.service'
import { BadRequestError, NotFoundError, ResponseHelper, getParamString } from '@/utils'
import type { AssetData, AssetFilters, FilterOptions } from '@poveroh/types'
import type { Request, Response } from 'express'

export class AssetController {
    private readonly assetService = new AssetService()

    // DELETE /:id
    async deleteAsset(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing asset ID in path')

            await this.assetService.deleteAsset(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /
    async deleteAllAssets(req: Request, res: Response) {
        try {
            await this.assetService.deleteAllAssets()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /:id
    async readAssetById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing asset ID in path')

            const data = await this.assetService.getAssetById(id)
            if (!data) throw new NotFoundError('Asset not found')

            return ResponseHelper.success<AssetData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /
    async readAssets(req: Request, res: Response) {
        try {
            const filters = (req.query.filter || {}) as AssetFilters
            const options = (req.query.options || {}) as FilterOptions
            const skip = Number.isNaN(Number(options.skip)) ? 0 : Number(options.skip)
            const take = Number.isNaN(Number(options.take)) ? 20 : Number(options.take)

            const data = await this.assetService.getAssets(filters, skip, take)

            return ResponseHelper.success<AssetData[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /portfolio/summary
    async readPortfolioSummary(req: Request, res: Response) {
        try {
            const summary = await this.assetService.getPortfolioSummary()

            return ResponseHelper.success(res, summary)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
