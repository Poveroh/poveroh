import { AssetTransactionService } from './asset-transaction.service'
import { BadRequestError, NotFoundError, ResponseHelper, getParamString, parseRequestBody } from '@/utils'
import { CreateAssetTransactionRequestSchema, UpdateAssetTransactionRequestSchema } from '@poveroh/schemas'
import type { AssetTransactionData, AssetTransactionFilters, FilterOptions } from '@poveroh/types'
import type { Request, Response } from 'express'

export class AssetTransactionController {
    private readonly assetTransactionService = new AssetTransactionService()

    // POST /
    async createAssetTransaction(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateAssetTransactionRequestSchema, req.body)

            const transaction = await this.assetTransactionService.createAssetTransaction(payload)

            return ResponseHelper.success<AssetTransactionData>(res, transaction)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /:id
    async updateAssetTransaction(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing asset transaction ID in path')

            const payload = parseRequestBody(UpdateAssetTransactionRequestSchema, req.body)
            await this.assetTransactionService.updateAssetTransaction(id, payload)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /:id
    async deleteAssetTransaction(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing asset transaction ID in path')

            await this.assetTransactionService.deleteAssetTransaction(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /
    async deleteAllAssetTransactions(req: Request, res: Response) {
        try {
            await this.assetTransactionService.deleteAllAssetTransactions()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /:id
    async readAssetTransactionById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing asset transaction ID in path')

            const data = await this.assetTransactionService.getAssetTransactionById(id)
            if (!data) throw new NotFoundError('Asset transaction not found')

            return ResponseHelper.success<AssetTransactionData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /
    async readAssetTransactions(req: Request, res: Response) {
        try {
            const filters = (req.query.filter || {}) as AssetTransactionFilters
            const options = (req.query.options || {}) as FilterOptions
            const skip = Number.isNaN(Number(options.skip)) ? 0 : Number(options.skip)
            const take = Number.isNaN(Number(options.take)) ? 20 : Number(options.take)

            const data = await this.assetTransactionService.getAssetTransactions(filters, skip, take)

            return ResponseHelper.success<AssetTransactionData[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
