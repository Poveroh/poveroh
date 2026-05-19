import prisma, { Prisma } from '@poveroh/prisma'
import type {
    CreateSubscriptionRequest,
    SubscriptionData,
    SubscriptionFilters,
    UpdateSubscriptionRequest
} from '@poveroh/types'
import { buildWhere } from '@/helpers/filter.helper'

const subscriptionSelect = {
    id: true,
    title: true,
    description: true,
    amount: true,
    currency: true,
    appearanceMode: true,
    appearanceLogoIcon: true,
    appearanceIconColor: true,
    firstPayment: true,
    cycleNumber: true,
    cyclePeriod: true,
    rememberPeriod: true,
    financialAccountId: true,
    isEnabled: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.SubscriptionSelect

export class SubscriptionRepository {
    /**
     * Creates a new subscription in the database, associating it with the specified user and using the provided payload for the subscription details.
     * @param userId The ID of the user who owns the subscription.
     * @param id The unique identifier for the subscription being created.
     * @param payload The data required to create a new subscription.
     * @returns A promise that resolves to the data of the newly created subscription.
     */
    async create(userId: string, id: string, payload: CreateSubscriptionRequest): Promise<SubscriptionData> {
        return (await prisma.subscription.create({
            data: { ...payload, id, userId },
            select: subscriptionSelect
        })) as unknown as SubscriptionData
    }

    /**
     * Updates an existing subscription in the database, ensuring it belongs to the specified user and is not deleted.
     * @param userId The ID of the user who owns the subscription.
     * @param id The unique identifier of the subscription to be updated.
     * @param payload The data required to update the subscription.
     * @returns A promise that resolves when the subscription has been updated.
     */
    async update(userId: string, id: string, payload: UpdateSubscriptionRequest): Promise<void> {
        await prisma.subscription.update({
            where: { id, userId, deletedAt: null },
            data: payload
        })
    }

    /** Soft deletes a subscription by setting its deletedAt timestamp, ensuring it belongs to the specified user and is not already deleted.
     * @param userId The ID of the user who owns the subscription.
     * @param id The unique identifier of the subscription to be deleted.
     * @param deletedAt The timestamp indicating when the subscription was deleted.
     * @returns A promise that resolves when the subscription has been soft deleted.
     * */
    async softDelete(userId: string, id: string, deletedAt: Date): Promise<void> {
        await prisma.subscription.update({
            where: { id, userId, deletedAt: null },
            data: { deletedAt }
        })
    }

    /** Soft deletes all subscriptions for a user by setting their deletedAt timestamp, ensuring they are not already deleted.
     * @param userId The ID of the user who owns the subscriptions.
     * @param deletedAt The timestamp indicating when the subscriptions were deleted.
     * @returns A promise that resolves when the subscriptions have been soft deleted.
     * */
    async softDeleteAll(userId: string, deletedAt: Date): Promise<void> {
        await prisma.subscription.updateMany({
            where: { userId, deletedAt: null },
            data: { deletedAt }
        })
    }

    /** Finds a subscription by its ID, ensuring it belongs to the specified user and is not deleted.
     * @param userId The ID of the user who owns the subscription.
     * @param id The unique identifier of the subscription to be retrieved.
     * @returns A promise that resolves to the subscription data or null if not found.
     */
    async findById(userId: string, id: string): Promise<SubscriptionData | null> {
        return (await prisma.subscription.findFirst({
            where: { id, userId, deletedAt: null },
            select: subscriptionSelect
        })) as unknown as SubscriptionData | null
    }

    /** Finds multiple subscriptions based on filters, ensuring they belong to the specified user and are not deleted.
     * @param userId The ID of the user who owns the subscriptions.
     * @param filters The filters to apply when retrieving subscriptions.
     * @param skip The number of subscriptions to skip for pagination.
     * @param take The number of subscriptions to take for pagination.
     * @returns A promise that resolves to an array of subscription data.
     */
    async findMany(
        userId: string,
        filters: SubscriptionFilters,
        skip: number,
        take: number
    ): Promise<SubscriptionData[]> {
        const where = buildWhere({ ...filters, deletedAt: null, userId }, ['title', 'description'])

        return (await prisma.subscription.findMany({
            where,
            select: subscriptionSelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })) as unknown as SubscriptionData[]
    }
}
