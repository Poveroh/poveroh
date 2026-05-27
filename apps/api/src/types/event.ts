import type {
    AssetData,
    AssetTransactionData,
    CategoryData,
    FinancialAccountData,
    GetDashboardLayout,
    ImportData,
    SubcategoryData,
    SubscriptionData,
    TransactionData,
    User,
    UserPreferences
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
    | 'transaction.updated'
    | 'transaction.deleted'
    | 'asset.created'
    | 'asset.updated'
    | 'asset.deleted'
    | 'asset-transaction.created'
    | 'asset-transaction.updated'
    | 'asset-transaction.deleted'
    | 'import.created'
    | 'import.updated'
    | 'import.deleted'
    | 'snapshot.generated'
    | 'user.updated'
    | 'user-preferences.updated'
    | 'dashboard.updated'
    | 'market-data-credential.updated'
    | 'market-data-credential.deleted'

/**
 * Every domain event carries the authenticated user id plus, where a clean DTO exists, the full entity
 * payload (`data`) so subscribers (e.g. the activity audit log) have the complete snapshot without an extra fetch.
 * Entities without a serializable DTO at the emit site (encrypted credentials, snapshot Prisma rows) carry a
 * minimal identifier instead.
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
    'transaction.updated': { userId: string; data: TransactionData }
    'transaction.deleted': { userId: string; data: TransactionData }
    'asset.created': { userId: string; data: AssetData }
    'asset.updated': { userId: string; data: AssetData }
    'asset.deleted': { userId: string; data: AssetData }
    'asset-transaction.created': { userId: string; data: AssetTransactionData }
    'asset-transaction.updated': { userId: string; data: AssetTransactionData }
    'asset-transaction.deleted': { userId: string; data: AssetTransactionData }
    'import.created': { userId: string; data: ImportData }
    'import.updated': { userId: string; data: ImportData }
    'import.deleted': { userId: string; data: ImportData }
    'snapshot.generated': { userId: string; snapshotId: string }
    'user.updated': { userId: string; data: User }
    'user-preferences.updated': { userId: string; data: UserPreferences }
    'dashboard.updated': { userId: string; data: GetDashboardLayout }
    'market-data-credential.updated': { userId: string; providerId: string }
    'market-data-credential.deleted': { userId: string; providerId: string }
}

export type DomainEventHandler<EventName extends DomainEventName> = (
    payload: DomainEventPayloads[EventName]
) => void | Promise<void>
