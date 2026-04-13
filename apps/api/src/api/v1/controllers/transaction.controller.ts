import { Request, Response } from 'express'
import { QueryTransactionFilters } from '@poveroh/types'
import { getParamString } from '../../../utils/request'
import { BadRequestError, NotFoundError, ResponseHelper } from '@/src/utils'
import { TransactionService } from '../services/transaction.service'

export class TransactionController {
    //POST /
    static async createTransaction(req: Request, res: Response) {
        try {
            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const { data } = req.body

            if (!data) {
                throw new BadRequestError('Data not provided')
            }

            const transactionService = new TransactionService(req.user.id)
            const result = await transactionService.handleTransaction(data)

            return ResponseHelper.success(res, result)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //PATCH /:id
    static async updateTransaction(req: Request, res: Response) {
        try {
            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const id = getParamString(req.params, 'id')
            const { data } = req.body

            if (!id || !data) {
                throw new BadRequestError('Missing transaction ID or data')
            }

            const transactionService = new TransactionService(req.user.id)
            const result = await transactionService.handleTransaction(data, id)

            return ResponseHelper.success(res, result)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //DELETE /:id
    static async deleteTransaction(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing transaction ID')
            }

            const transactionService = new TransactionService(req.user.id)
            await transactionService.deleteTransaction(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //DELETE /
    static async deleteAllTransactions(req: Request, res: Response) {
        try {
            const transactionService = new TransactionService(req.user.id)
            await transactionService.deleteAllTransactions()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //GET /:id
    static async readTransactionById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing transaction ID')
            }

            const transactionService = new TransactionService(req.user.id)
            const data = await transactionService.getTransactionById(id)

            if (!data) {
                throw new NotFoundError('Transaction not found')
            }

            return ResponseHelper.success(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //GET /
    static async readTransactions(req: Request, res: Response) {
        try {
            const queryFilters = req.query as QueryTransactionFilters

            const transactionService = new TransactionService(req.user.id)
            const data = await transactionService.getTransactions(queryFilters)

            return ResponseHelper.success(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
