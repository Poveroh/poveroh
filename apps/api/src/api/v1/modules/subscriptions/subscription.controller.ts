import type { Request, Response } from 'express'
import type { FilterOptions, SubscriptionData, SubscriptionFilters } from '@poveroh/types'
import { CreateSubscriptionRequestSchema, UpdateSubscriptionRequestSchema } from '@poveroh/schemas'
import { SubscriptionService } from './subscription.service'
import { parseRequestBody, ResponseHelper, getParamString, BadRequestError, NotFoundError } from '@/utils'

export class SubscriptionController {
    private readonly subscriptionService = new SubscriptionService()

    // POST /
    async createSubscription(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateSubscriptionRequestSchema, req.body)
            const subscription = await this.subscriptionService.createSubscription(payload, req.file)

            return ResponseHelper.success<SubscriptionData>(res, subscription)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /:id
    async updateSubscription(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing subscription ID')

            const payload = parseRequestBody(UpdateSubscriptionRequestSchema, req.body)
            await this.subscriptionService.updateSubscription(id, payload, req.file)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /:id
    async deleteSubscription(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing subscription ID')

            await this.subscriptionService.deleteSubscription(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // DELETE /
    async deleteAllSubscriptions(req: Request, res: Response) {
        try {
            await this.subscriptionService.deleteAllSubscriptions()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /:id
    async readSubscriptionById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing subscription ID')

            const data = await this.subscriptionService.getSubscriptionById(id)
            if (!data) throw new NotFoundError('Subscription not found')

            return ResponseHelper.success<SubscriptionData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /
    async readSubscriptions(req: Request, res: Response) {
        try {
            const filters = (req.query.filter || {}) as SubscriptionFilters
            const options = (req.query.options || {}) as FilterOptions
            const skip = isNaN(Number(options.skip)) ? 0 : Number(options.skip)
            const take = isNaN(Number(options.take)) ? 20 : Number(options.take)

            const data = await this.subscriptionService.getSubscriptions(filters, skip, take)

            return ResponseHelper.success<SubscriptionData[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
