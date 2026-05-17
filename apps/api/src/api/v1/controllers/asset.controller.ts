import type { Request, Response } from 'express'
import type { AssetFilters, FilterOptions } from '@poveroh/types'
import { getParamString } from '../../../utils/request'
import { BadRequestError, NotFoundError, ResponseHelper } from '@/src/utils'
import { AssetService } from '../services/asset.service'

export class AssetController {
    // DELETE /:id
    static async deleteAsset(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) {
                throw new BadRequestError('Missing asset ID in path')
            }

            const assetService = new AssetService(req.user.id)
            await assetService.deleteAsset(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /
    static async deleteAllAssets(req: Request, res: Response) {
        try {
            const assetService = new AssetService(req.user.id)
            await assetService.deleteAllAssets()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /:id
    static async readAssetById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) {
                throw new BadRequestError('Missing asset ID in path')
            }

            const assetService = new AssetService(req.user.id)
            const asset = await assetService.getAssetById(id)

            if (!asset) {
                throw new NotFoundError('Asset not found')
            }

            return ResponseHelper.success(res, asset)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /
    static async readAssets(req: Request, res: Response) {
        try {
            const filters = (req.query.filter || {}) as AssetFilters
            const options = (req.query.options || {}) as FilterOptions
            const skip = Number.isNaN(Number(options.skip)) ? 0 : Number(options.skip)
            const take = Number.isNaN(Number(options.take)) ? 20 : Number(options.take)

            const assetService = new AssetService(req.user.id)
            const assets = await assetService.getAssets(filters, skip, take)

            return ResponseHelper.success(res, assets)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /portfolio/summary
    static async readPortfolioSummary(req: Request, res: Response) {
        try {
            const assetService = new AssetService(req.user.id)
            const summary = await assetService.getPortfolioSummary()

            return ResponseHelper.success(res, summary)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
