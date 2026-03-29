import prisma from '@poveroh/prisma'
import { buildWhere } from '../../../helpers/filter.helper'
import { BaseService } from './base.service'
import {
    CreateSubscriptionRequest,
    SubscriptionData,
    SubscriptionFilters,
    UpdateSubscriptionRequest
} from '@poveroh/types'

/**
 * Service class for managing subscriptions, including creating, updating, deleting, and retrieving subscriptions for the authenticated user
 * All methods automatically retrieve the user ID from the request context.
 */
export class SubscriptionService extends BaseService {
    /**
     * Initializes the SubscriptionService with the user ID from the request context
     * @param userId The ID of the authenticated user
     */
    constructor(userId: string) {
        super(userId, 'subscription')
    }

    /**
     * Creates a new subscription for the authenticated user with the provided data and optional logo file
     * @param payload The data for the new subscription
     * @param file An optional logo file for the subscription
     * @returns The created subscription data response
     */
    async createSubscription(
        payload: CreateSubscriptionRequest,
        file?: Express.Multer.File
    ): Promise<SubscriptionData> {
        const userId = this.getUserId()

        const generatedId = crypto.randomUUID()

        if (file) {
            payload.appearanceLogoIcon = await this.saveFile(generatedId, file)
        }

        return (await prisma.subscription.create({
            data: {
                ...payload,
                id: generatedId,
                userId
            }
        })) as unknown as SubscriptionData
    }

    /**
     * Updates an existing subscription with the specified ID for the authenticated user
     * @param id The ID of the subscription to update
     * @param payload The updated data for the subscription
     * @param file An optional new logo file for the subscription
     * @returns The updated subscription data response
     */
    async updateSubscription(
        id: string,
        payload: UpdateSubscriptionRequest,
        file?: Express.Multer.File
    ): Promise<void> {
        const userId = this.getUserId()

        if (file) {
            payload.appearanceLogoIcon = await this.saveFile(id, file)
        }

        await prisma.subscription.update({
            where: { id, userId, deletedAt: null },
            data: payload
        })
    }

    /**
     * Deletes a subscription with the specified ID for the authenticated user
     * @param id The ID of the subscription to delete
     */
    async deleteSubscription(id: string): Promise<void> {
        const userId = this.getUserId()
        const deletedAt = new Date()

        await prisma.subscription.update({
            where: { id, userId, deletedAt: null },
            data: { deletedAt }
        })
    }

    /**
     * Deletes all subscriptions for the authenticated user
     */
    async deleteAllSubscriptions(): Promise<void> {
        const userId = this.getUserId()
        const deletedAt = new Date()

        await prisma.subscription.updateMany({
            where: { userId, deletedAt: null },
            data: { deletedAt }
        })
    }

    /**
     * Retrieves a subscription by its ID for the authenticated user
     * @param id The ID of the subscription to retrieve
     * @returns The subscription data response if found, or null if not found
     */
    async getSubscriptionById(id: string): Promise<SubscriptionData | null> {
        const userId = this.getUserId()

        return (await prisma.subscription.findFirst({
            where: { id, userId, deletedAt: null }
        })) as unknown as SubscriptionData | null
    }

    /**
     * Retrieves subscriptions for the authenticated user based on the provided filters and pagination
     * @param filters The filters to apply to the subscription query
     * @param skip The number of subscriptions to skip for pagination
     * @param take The number of subscriptions to take for pagination
     * @returns An object containing the subscription data and the total count
     */
    async getSubscriptions(filters: SubscriptionFilters, skip: number, take: number): Promise<SubscriptionData[]> {
        const userId = this.getUserId()

        const where = {
            ...buildWhere(filters),
            userId,
            deletedAt: null
        }

        return (await prisma.subscription.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })) as unknown as SubscriptionData[]
    }
}
