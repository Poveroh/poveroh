import type { Request, Response } from 'express'
import type {
    AssetTransactionFilters,
    CreateAssetTransactionRequest,
    FilterOptions,
    UpdateAssetTransactionRequest
} from '@poveroh/types'
import { getParamString } from '../../../utils/request'
import { BadRequestError, NotFoundError, ResponseHelper } from '@/src/utils'
import { AssetService } from '../services/asset.service'

export class AssetTransactionController {
    // Creates a new asset transaction.
    static async createAssetTransaction(req: Request, res: Response) {
        try {
            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const payload = req.body as CreateAssetTransactionRequest
            const assetService = new AssetService(req.user.id)
            const transaction = await assetService.createAssetTransaction(payload)

            return ResponseHelper.success(res, transaction)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Updates an existing asset transaction.
    static async updateAssetTransaction(req: Request, res: Response) {
        try {
            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const id = getParamString(req.params, 'id')
            if (!id) {
                throw new BadRequestError('Missing asset transaction ID in path')
            }

            const payload = req.body as UpdateAssetTransactionRequest
            const assetService = new AssetService(req.user.id)
            await assetService.updateAssetTransaction(id, payload)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Soft deletes a single asset transaction.
    static async deleteAssetTransaction(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) {
                throw new BadRequestError('Missing asset transaction ID in path')
            }

            const assetService = new AssetService(req.user.id)
            await assetService.deleteAssetTransaction(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Soft deletes all asset transactions for the authenticated user.
    static async deleteAllAssetTransactions(req: Request, res: Response) {
        try {
            const assetService = new AssetService(req.user.id)
            await assetService.deleteAllAssetTransactions()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Retrieves a single asset transaction by ID.
    static async readAssetTransactionById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) {
                throw new BadRequestError('Missing asset transaction ID in path')
            }

            const assetService = new AssetService(req.user.id)
            const transaction = await assetService.getAssetTransactionById(id)

            if (!transaction) {
                throw new NotFoundError('Asset transaction not found')
            }

            return ResponseHelper.success(res, transaction)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Retrieves the asset transaction list using optional filters and pagination.
    static async readAssetTransactions(req: Request, res: Response) {
        try {
            const filters = (req.query.filter || {}) as AssetTransactionFilters
            const options = (req.query.options || {}) as FilterOptions
            const skip = Number.isNaN(Number(options.skip)) ? 0 : Number(options.skip)
            const take = Number.isNaN(Number(options.take)) ? 20 : Number(options.take)

            const assetService = new AssetService(req.user.id)
            const transactions = await assetService.getAssetTransactions(filters, skip, take)

            return ResponseHelper.success(res, transactions)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
