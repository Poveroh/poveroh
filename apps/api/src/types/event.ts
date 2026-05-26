import type {
    AssetData,
    AssetTransactionData,
    CategoryData,
    FinancialAccountData,
    SnapshotData,
    SubcategoryData,
    SubscriptionData,
    TransactionData
} from '@poveroh/types'

export type DomainEventName =
    | 'category.created'
    | 'category.updated'
    | 'category.deleted'
    | 'subcategory.created'
    | 'subcategory.updated'
    | 'subcategory.deleted'
    | 'subscription.created'
    | 'subscription.updated'
    | 'subscription.deleted'
    | 'financial-account.created'
    | 'financial-account.updated'
    | 'financial-account.deleted'
    | 'transaction.created'
    | 'asset.created'
    | 'asset.updated'
    | 'asset.deleted'
    | 'asset-transaction.created'
    | 'asset-transaction.updated'
    | 'asset-transaction.deleted'
    | 'snapshot.generated'

/**
 * Every domain event carries the authenticated user id plus the full entity payload (`data`)
 * so subscribers (e.g. the activity audit log) have the complete snapshot without an extra fetch.
 */
export type DomainEventPayloads = {
    'category.created': { userId: string; data: CategoryData }
    'category.updated': { userId: string; data: CategoryData }
    'category.deleted': { userId: string; data: CategoryData }
    'subcategory.created': { userId: string; data: SubcategoryData }
    'subcategory.updated': { userId: string; data: SubcategoryData }
    'subcategory.deleted': { userId: string; data: SubcategoryData }
    'subscription.created': { userId: string; data: SubscriptionData }
    'subscription.updated': { userId: string; data: SubscriptionData }
    'subscription.deleted': { userId: string; data: SubscriptionData }
    'financial-account.created': { userId: string; data: FinancialAccountData }
    'financial-account.updated': { userId: string; data: FinancialAccountData }
    'financial-account.deleted': { userId: string; data: FinancialAccountData }
    'transaction.created': { userId: string; data: TransactionData }
    'asset.created': { userId: string; data: AssetData }
    'asset.updated': { userId: string; data: AssetData }
    'asset.deleted': { userId: string; data: AssetData }
    'asset-transaction.created': { userId: string; data: AssetTransactionData }
    'asset-transaction.updated': { userId: string; data: AssetTransactionData }
    'asset-transaction.deleted': { userId: string; data: AssetTransactionData }
    'snapshot.generated': { userId: string; data: SnapshotData }
}

export type DomainEventHandler<EventName extends DomainEventName> = (
    payload: DomainEventPayloads[EventName]
) => void | Promise<void>
