import type {
    CreateSubscriptionRequest,
    SubscriptionData,
    SubscriptionFilters,
    UpdateSubscriptionRequest
} from '@poveroh/types'
import { BaseService } from '@/v1/modules/base/base.service'
import { eventBus } from '@/v1/worker/events/event-bus'
import { SubscriptionRepository } from './subscription.repository'

export class SubscriptionService extends BaseService {
    private readonly subscriptionRepository = new SubscriptionRepository()

    constructor() {
        super('subscription')
    }

    /**
     * Creates a new subscription for the authenticated user, optionally handling an uploaded logo file.
     * @param payload The data required to create a new subscription.
     * @param file An optional file object representing the uploaded logo for the subscription.
     * @returns A promise that resolves to the data of the newly created subscription.
     */
    async createSubscription(
        payload: CreateSubscriptionRequest,
        file?: Express.Multer.File
    ): Promise<SubscriptionData> {
        const userId = this.context.currentUser.id
        const generatedId = crypto.randomUUID()
        const payloadWithLogo = { ...payload }

        if (file) {
            payloadWithLogo.appearanceLogoIcon = await this.media.saveFile(generatedId, file)
        }

        const subscription = await this.subscriptionRepository.create(userId, generatedId, payloadWithLogo)
        await eventBus.emit('subscription.created', { userId, data: subscription })

        return subscription
    }

    /**
     * Updates an existing subscription owned by the authenticated user, optionally handling an uploaded logo file.
     * @param id The unique identifier of the subscription to be updated.
     * @param payload The data required to update the subscription.
     * @param file An optional file object representing the uploaded logo for the subscription.
     * @returns A promise that resolves when the subscription has been updated.
     */
    async updateSubscription(
        id: string,
        payload: UpdateSubscriptionRequest,
        file?: Express.Multer.File
    ): Promise<void> {
        const userId = this.context.currentUser.id
        const payloadWithLogo = { ...payload }

        if (file) {
            payloadWithLogo.appearanceLogoIcon = await this.media.saveFile(id, file)
        }

        await this.subscriptionRepository.update(userId, id, payloadWithLogo)

        const data = await this.subscriptionRepository.findById(userId, id)
        if (data) await eventBus.emit('subscription.updated', { userId, data })
    }

    /**
     * Soft-deletes a subscription by marking it as deleted in the repository.
     * @param id The unique identifier of the subscription to be deleted.
     * @returns A promise that resolves when the subscription has been soft-deleted.
     */
    async deleteSubscription(id: string): Promise<void> {
        const userId = this.context.currentUser.id

        const data = await this.subscriptionRepository.findById(userId, id)
        await this.subscriptionRepository.softDelete(userId, id, new Date())

        if (data) await eventBus.emit('subscription.deleted', { userId, data })
    }

    /**
     * Soft-deletes all visible subscriptions for the authenticated user.
     * @returns A promise that resolves when all subscriptions have been soft-deleted.
     */
    async deleteAllSubscriptions(): Promise<void> {
        await this.subscriptionRepository.softDeleteAll(this.context.currentUser.id, new Date())
    }

    /**
     * Retrieves a subscription by its unique identifier for the authenticated user.
     * @param id The unique identifier of the subscription to be retrieved.
     * @returns A promise that resolves to the subscription data if found, or null if the subscription does not exist.
     */
    async getSubscriptionById(id: string): Promise<SubscriptionData | null> {
        return this.subscriptionRepository.findById(this.context.currentUser.id, id)
    }

    /**
     * Retrieves a list of subscriptions for the authenticated user based on provided filters and pagination parameters.
     * @param filters The filters to apply when querying subscriptions.
     * @param skip The number of subscriptions to skip, useful for pagination.
     * @param take The number of subscriptions to take, useful for pagination.
     * @returns A promise that resolves to an array of subscription data matching the specified filters and pagination parameters.
     */
    async getSubscriptions(filters: SubscriptionFilters, skip: number, take: number): Promise<SubscriptionData[]> {
        return this.subscriptionRepository.findMany(this.context.currentUser.id, filters, skip, take)
    }
}
