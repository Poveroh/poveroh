import type { DomainEventName, DomainEventPayloads } from '@/types'
import type { UserActivityActionEnum, UserActivityEntityEnum } from '@poveroh/types'
import { eventBus } from './event-bus'
import { UserActivityService } from '../modules/users/activities/user-activity.service'

let registered = false

/**
 * Wires the audit-log subscribers onto the in-process event bus.
 * Each domain event is mapped to an (entityType, action) pair and persisted through the user-activity
 * service, storing the full entity payload as metadata. Recording is best-effort (see UserActivityService.record).
 * Idempotent: safe to call once at server startup.
 */
export const registerActivitySubscribers = (): void => {
    if (registered) return
    registered = true

    const activityService = new UserActivityService()

    // Subscribes a single domain event, translating its full payload into an activity record.
    const on = <EventName extends DomainEventName>(
        eventName: EventName,
        entityType: UserActivityEntityEnum,
        action: UserActivityActionEnum
    ): void => {
        eventBus.on(eventName, async (payload: DomainEventPayloads[EventName]) => {
            await activityService.record({
                entityType,
                action,
                entityId: payload.data.id,
                metadata: payload.data as unknown as Record<string, unknown>
            })
        })
    }

    on('category.created', 'CATEGORY', 'CREATED')
    on('category.updated', 'CATEGORY', 'UPDATED')
    on('category.deleted', 'CATEGORY', 'DELETED')

    on('subcategory.created', 'SUBCATEGORY', 'CREATED')
    on('subcategory.updated', 'SUBCATEGORY', 'UPDATED')
    on('subcategory.deleted', 'SUBCATEGORY', 'DELETED')

    on('subscription.created', 'SUBSCRIPTION', 'CREATED')
    on('subscription.updated', 'SUBSCRIPTION', 'UPDATED')
    on('subscription.deleted', 'SUBSCRIPTION', 'DELETED')

    on('financial-account.created', 'FINANCIAL_ACCOUNT', 'CREATED')
    on('financial-account.updated', 'FINANCIAL_ACCOUNT', 'UPDATED')
    on('financial-account.deleted', 'FINANCIAL_ACCOUNT', 'DELETED')

    on('transaction.created', 'TRANSACTION', 'CREATED')

    on('asset.created', 'ASSET', 'CREATED')
    on('asset.updated', 'ASSET', 'UPDATED')
    on('asset.deleted', 'ASSET', 'DELETED')

    on('asset-transaction.created', 'ASSET_TRANSACTION', 'CREATED')
    on('asset-transaction.updated', 'ASSET_TRANSACTION', 'UPDATED')
    on('asset-transaction.deleted', 'ASSET_TRANSACTION', 'DELETED')

    on('snapshot.generated', 'SNAPSHOT', 'GENERATED')
}
