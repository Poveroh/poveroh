import type { DomainEventName, DomainEventPayloads } from '@/types'
import type { CreateUserActivityRequest, UserActivityActionEnum, UserActivityEntityEnum } from '@poveroh/types'
import { eventBus } from './event-bus'
import { UserActivityService } from '../modules/users/activities/user-activity.service'

let registered = false

/**
 * Builds an activity record from a `{ data: { id } }` style payload, storing the full entity as metadata.
 * @param entityType The audit-log subject the activity refers to.
 * @param action The action performed on the subject.
 * @returns A mapper turning the event payload into a CreateUserActivityRequest.
 */
const fromEntity =
    (entityType: UserActivityEntityEnum, action: UserActivityActionEnum) =>
    (payload: { data: { id: string } }): CreateUserActivityRequest => ({
        entityType,
        action,
        entityId: payload.data.id,
        metadata: payload.data as unknown as Record<string, unknown>
    })

/**
 * Wires the audit-log subscribers onto the in-process event bus.
 * Each domain event is mapped to an (entityType, action) pair and persisted through the user-activity
 * service. Recording is best-effort (see UserActivityService.record). Idempotent: safe to call once at startup.
 */
export const registerActivitySubscribers = (): void => {
    if (registered) return
    registered = true

    const activityService = new UserActivityService()

    // Subscribes a single domain event, translating its payload into an activity record.
    const on = <EventName extends DomainEventName>(
        eventName: EventName,
        toActivity: (payload: DomainEventPayloads[EventName]) => CreateUserActivityRequest
    ): void => {
        eventBus.on(eventName, async payload => {
            await activityService.record(toActivity(payload))
        })
    }

    on('category.created', fromEntity('CATEGORY', 'CREATED'))
    on('category.updated', fromEntity('CATEGORY', 'UPDATED'))
    on('category.deleted', fromEntity('CATEGORY', 'DELETED'))

    on('subcategory.created', fromEntity('SUBCATEGORY', 'CREATED'))
    on('subcategory.updated', fromEntity('SUBCATEGORY', 'UPDATED'))
    on('subcategory.deleted', fromEntity('SUBCATEGORY', 'DELETED'))

    on('subscription.created', fromEntity('SUBSCRIPTION', 'CREATED'))
    on('subscription.updated', fromEntity('SUBSCRIPTION', 'UPDATED'))
    on('subscription.deleted', fromEntity('SUBSCRIPTION', 'DELETED'))

    on('financial-account.created', fromEntity('FINANCIAL_ACCOUNT', 'CREATED'))
    on('financial-account.updated', fromEntity('FINANCIAL_ACCOUNT', 'UPDATED'))
    on('financial-account.deleted', fromEntity('FINANCIAL_ACCOUNT', 'DELETED'))

    on('transaction.created', fromEntity('TRANSACTION', 'CREATED'))
    on('transaction.updated', fromEntity('TRANSACTION', 'UPDATED'))
    on('transaction.deleted', fromEntity('TRANSACTION', 'DELETED'))

    on('asset.created', fromEntity('ASSET', 'CREATED'))
    on('asset.updated', fromEntity('ASSET', 'UPDATED'))
    on('asset.deleted', fromEntity('ASSET', 'DELETED'))

    on('asset-transaction.created', fromEntity('ASSET_TRANSACTION', 'CREATED'))
    on('asset-transaction.updated', fromEntity('ASSET_TRANSACTION', 'UPDATED'))
    on('asset-transaction.deleted', fromEntity('ASSET_TRANSACTION', 'DELETED'))

    on('import.created', fromEntity('IMPORT', 'CREATED'))
    on('import.updated', fromEntity('IMPORT', 'UPDATED'))
    on('import.deleted', fromEntity('IMPORT', 'DELETED'))

    on('user.updated', fromEntity('USER', 'UPDATED'))

    // Singletons / non-DTO payloads: no entity id, or a domain-specific identifier.
    on('user-preferences.updated', payload => ({
        entityType: 'USER_PREFERENCES',
        action: 'UPDATED',
        entityId: null,
        metadata: payload.data as unknown as Record<string, unknown>
    }))

    on('dashboard.updated', payload => ({
        entityType: 'DASHBOARD_LAYOUT',
        action: 'UPDATED',
        entityId: null,
        metadata: payload.data as unknown as Record<string, unknown>
    }))

    on('snapshot.generated', payload => ({
        entityType: 'SNAPSHOT',
        action: 'GENERATED',
        entityId: payload.snapshotId,
        metadata: { snapshotId: payload.snapshotId }
    }))

    on('market-data-credential.updated', payload => ({
        entityType: 'MARKET_DATA_CREDENTIAL',
        action: 'UPDATED',
        entityId: payload.providerId,
        metadata: { providerId: payload.providerId }
    }))

    on('market-data-credential.deleted', payload => ({
        entityType: 'MARKET_DATA_CREDENTIAL',
        action: 'DELETED',
        entityId: payload.providerId,
        metadata: { providerId: payload.providerId }
    }))
}
