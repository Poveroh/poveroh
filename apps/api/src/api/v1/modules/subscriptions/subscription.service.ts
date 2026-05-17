import type {@/src/api/v1/modules/base/base.service
    CreateSubscriptionRequest,
    SubscriptionData,
    SubscriptionFilters,
    UpdateSubscriptionRequest
} from '@poveroh/types'
import { BaseService } from '@/src/api/v1/services/base.service'
import { eventBus } from '@/src/api/v1/events/event-bus'
import { SubscriptionRepository } from './subscription.repository'

export class SubscriptionService extends BaseService {
    private readonly subscriptionRepository = new SubscriptionRepository()

    constructor() {
        super('subscription')
    }

    // Creates a subscription and persists an optional uploaded logo.
    async createSubscription(
        payload: CreateSubscriptionRequest,
        file?: Express.Multer.File
    ): Promise<SubscriptionData> {
        const userId = this.getUserId()
        const generatedId = crypto.randomUUID()
        const payloadWithLogo = { ...payload }

        if (file) {
            payloadWithLogo.appearanceLogoIcon = await this.saveFile(generatedId, file)
        }

        const subscription = await this.subscriptionRepository.create(userId, generatedId, payloadWithLogo)
        await eventBus.emit('subscription.created', { subscriptionId: subscription.id, userId })

        return subscription
    }

    // Updates a subscription owned by the authenticated user.
    async updateSubscription(
        id: string,
        payload: UpdateSubscriptionRequest,
        file?: Express.Multer.File
    ): Promise<void> {
        const userId = this.getUserId()
        const payloadWithLogo = { ...payload }

        if (file) {
            payloadWithLogo.appearanceLogoIcon = await this.saveFile(id, file)
        }

        await this.subscriptionRepository.update(userId, id, payloadWithLogo)
        await eventBus.emit('subscription.updated', { subscriptionId: id, userId })
    }

    // Soft-deletes one subscription.
    async deleteSubscription(id: string): Promise<void> {
        const userId = this.getUserId()
        await this.subscriptionRepository.softDelete(userId, id, new Date())
        await eventBus.emit('subscription.deleted', { subscriptionId: id, userId })
    }

    // Soft-deletes all visible subscriptions for the authenticated user.
    async deleteAllSubscriptions(): Promise<void> {
        await this.subscriptionRepository.softDeleteAll(this.getUserId(), new Date())
    }

    // Reads one subscription DTO by user-scoped id.
    async getSubscriptionById(id: string): Promise<SubscriptionData | null> {
        return this.subscriptionRepository.findById(this.getUserId(), id)
    }

    // Reads subscription DTOs with repository-owned filtering.
    async getSubscriptions(filters: SubscriptionFilters, skip: number, take: number): Promise<SubscriptionData[]> {
        return this.subscriptionRepository.findMany(this.getUserId(), filters, skip, take)
    }
}
