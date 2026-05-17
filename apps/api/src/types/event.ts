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
    | 'asset.updated'
    | 'snapshot.generated'

export type DomainEventPayloads = {
    'category.created': { categoryId: string; userId: string }
    'category.updated': { categoryId: string; userId: string }
    'category.deleted': { categoryId: string; userId: string }
    'subcategory.created': { subcategoryId: string; userId: string }
    'subcategory.updated': { subcategoryId: string; userId: string }
    'subcategory.deleted': { subcategoryId: string; userId: string }
    'subscription.created': { subscriptionId: string; userId: string }
    'subscription.updated': { subscriptionId: string; userId: string }
    'subscription.deleted': { subscriptionId: string; userId: string }
    'financial-account.created': { financialAccountId: string; userId: string }
    'financial-account.updated': { financialAccountId: string; userId: string }
    'financial-account.deleted': { financialAccountId: string; userId: string }
    'transaction.created': { transactionId: string; userId: string }
    'asset.updated': { assetId: string; userId: string }
    'snapshot.generated': { snapshotId: string; userId: string }
}

export type DomainEventHandler<EventName extends DomainEventName> = (
    payload: DomainEventPayloads[EventName]
) => void | Promise<void>
