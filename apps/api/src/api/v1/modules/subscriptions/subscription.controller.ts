import type { Request, Response } from 'express'
import type { FilterOptions, SubscriptionData, SubscriptionFilters } from '@poveroh/types'
import { getParamString } from '@/src/utils/request'
import { BadRequestError, NotFoundError, ResponseHelper } from '@/utils'
import { parseRequestBody } from '@/utils/validation'
import { CreateSubscriptionRequestSchema, UpdateSubscriptionRequestSchema } from '@poveroh/schemas'
import { SubscriptionService } from './subscription.service'

export class SubscriptionController {
    // Creates a subscription from multipart form data.
    static async createSubscription(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateSubscriptionRequestSchema, req.body)
            const subscriptionService = new SubscriptionService()
            const subscription = await subscriptionService.createSubscription(payload, req.file)

            return ResponseHelper.success(res, subscription)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Updates a user-owned subscription.
    static async updateSubscription(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing subscription ID')

            const payload = parseRequestBody(UpdateSubscriptionRequestSchema, req.body)
            const subscriptionService = new SubscriptionService()
            await subscriptionService.updateSubscription(id, payload, req.file)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Soft-deletes one subscription.
    static async deleteSubscription(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing subscription ID')

            const subscriptionService = new SubscriptionService()
            await subscriptionService.deleteSubscription(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Soft-deletes all subscriptions owned by the current user.
    static async deleteAllSubscriptions(req: Request, res: Response) {
        try {
            const subscriptionService = new SubscriptionService()
            await subscriptionService.deleteAllSubscriptions()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Reads one subscription by user-scoped id.
    static async readSubscriptionById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            if (!id) throw new BadRequestError('Missing subscription ID')

            const subscriptionService = new SubscriptionService()
            const data = await subscriptionService.getSubscriptionById(id)
            if (!data) throw new NotFoundError('Subscription not found')

            return ResponseHelper.success<SubscriptionData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Reads subscriptions using the existing query shape.
    static async readSubscriptions(req: Request, res: Response) {
        try {
            const filters = (req.query.filter || {}) as SubscriptionFilters
            const options = (req.query.options || {}) as FilterOptions
            const skip = isNaN(Number(options.skip)) ? 0 : Number(options.skip)
            const take = isNaN(Number(options.take)) ? 20 : Number(options.take)

            const subscriptionService = new SubscriptionService()
            const data = await subscriptionService.getSubscriptions(filters, skip, take)

            return ResponseHelper.success<SubscriptionData[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
