import type { Request, Response } from 'express'
import type { QueryTransactionFilters, TransactionData } from '@poveroh/types'
import { getParamString } from '@/utils/request'
import { BadRequestError, ResponseHelper } from '@/utils'
import { parseRequestBody } from '@/utils/validation'
import { CreateUpdateTransactionRequestSchema } from '@poveroh/schemas'
import { TransactionService } from './transaction.service'

export class TransactionController {
    private static readonly transactionService = new TransactionService()

    // POST /
    static async createTransaction(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateUpdateTransactionRequestSchema, req.body)
            const result = await this.transactionService.handleTransaction(payload, req.files as Express.Multer.File[])

            return ResponseHelper.success(res, result)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /:id
    static async updateTransaction(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing transaction ID')

            const payload = parseRequestBody(CreateUpdateTransactionRequestSchema, req.body)
            const result = await this.transactionService.handleTransaction(
                payload,
                req.files as Express.Multer.File[],
                id
            )

            return ResponseHelper.success(res, result)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /:id
    static async deleteTransaction(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing transaction ID')

            await this.transactionService.deleteTransaction(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /
    static async deleteAllTransactions(req: Request, res: Response) {
        try {
            await this.transactionService.deleteAllTransactions()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /:id
    static async readTransactionById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing transaction ID')

            const data = await this.transactionService.getTransactionById(id)

            return ResponseHelper.success<TransactionData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /
    static async readTransactions(req: Request, res: Response) {
        try {
            const queryFilters = req.query as QueryTransactionFilters
            const data = await this.transactionService.getTransactions(queryFilters)

            return ResponseHelper.success(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
