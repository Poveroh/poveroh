import { Request, Response } from 'express'
import {
    CreateSubscriptionRequest,
    SubscriptionData,
    SubscriptionFilters,
    UpdateSubscriptionRequest
} from '@poveroh/types'
import { getParamString } from '../../../utils/request'
import { BadRequestError, NotFoundError, ResponseHelper } from '@/src/utils'
import { SubscriptionService } from '../services/subscription.service'

export class SubscriptionController {
    //POST /
    static async createSubscription(req: Request, res: Response) {
        try {
            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const subscriptionPayload: CreateSubscriptionRequest = req.body

            const subscriptionService = new SubscriptionService(req.user.id)
            const subscription = await subscriptionService.createSubscription(subscriptionPayload, req.file)

            if (!subscription) {
                throw new NotFoundError('Subscription not created')
            }

            return ResponseHelper.success(res, subscription)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //PATCH /:id
    static async updateSubscription(req: Request, res: Response) {
        try {
            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const subscriptionPayload: UpdateSubscriptionRequest = req.body
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing subscription ID')
            }

            const subscriptionService = new SubscriptionService(req.user.id)
            await subscriptionService.updateSubscription(id, subscriptionPayload, req.file)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //DELETE /:id
    static async deleteSubscription(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing subscription ID')
            }

            const subscriptionService = new SubscriptionService(req.user.id)
            await subscriptionService.deleteSubscription(id)

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //DELETE /
    static async deleteAllSubscriptions(req: Request, res: Response) {
        try {
            const subscriptionService = new SubscriptionService(req.user.id)
            await subscriptionService.deleteAllSubscriptions()

            return ResponseHelper.success(res, true)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //GET /:id
    static async readSubscriptionById(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')

            if (!id) {
                throw new BadRequestError('Missing subscription ID')
            }

            const subscriptionService = new SubscriptionService(req.user.id)
            const data = await subscriptionService.getSubscriptionById(id)

            if (!data) {
                throw new NotFoundError('Subscription not found')
            }

            return ResponseHelper.success<SubscriptionData>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    //GET /
    static async readSubscriptions(req: Request, res: Response) {
        try {
            const filters = req.query as unknown as SubscriptionFilters
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const subscriptionService = new SubscriptionService(req.user.id)
            const data = await subscriptionService.getSubscriptions(filters, skip, take)

            return ResponseHelper.success<SubscriptionData[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
