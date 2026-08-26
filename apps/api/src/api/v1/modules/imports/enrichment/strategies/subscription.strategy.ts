import prisma from '@poveroh/prisma'
import type {
    EnrichmentStrategyEnum,
    ImportCandidateTransaction,
    ImportEnrichment,
    ImportEnrichmentResult,
    ImportEnrichmentStrategy,
    ImportSubscriptionRow
} from '@poveroh/types'
import { buildAmountKey, normalizeTitle } from '../normalize-title'

/**
 * Links an imported transaction to the subscription it pays for. A subscription is the most
 * reliable signal available — a recurring payment the user declared themselves — so it runs ahead
 * of the history lookup.
 *
 * A subscription carries no category of its own, so the category is inherited from how the user
 * categorized past payments of that same subscription. The first payment of a new subscription
 * therefore gets the link but no category; every later one gets both. Giving `Subscription` its own
 * `categoryId` would make this deterministic from the first match and is tracked separately.
 */
export class SubscriptionStrategy implements ImportEnrichmentStrategy {
    readonly strategy: EnrichmentStrategyEnum = 'SUBSCRIPTION'
    readonly priority = 20

    private readonly byAmountKey = new Map<string, ImportEnrichment>()
    private readonly byTitleKey = new Map<string, ImportEnrichment>()

    /**
     * Loads the user's active subscriptions and the category each one is usually filed under.
     * @param userId The ID of the user whose subscriptions are being indexed.
     * @param candidates The batch being imported, used to skip the work when it is empty.
     * @returns A promise that resolves once the in-memory index is built.
     */
    async prepare(userId: string, candidates: ImportCandidateTransaction[]): Promise<void> {
        this.byAmountKey.clear()
        this.byTitleKey.clear()

        if (candidates.length === 0) return

        const subscriptions = (await prisma.subscription.findMany({
            where: { userId, isEnabled: true, deletedAt: null },
            select: {
                id: true,
                title: true,
                amount: true,
                currency: true,
                appearanceLogoIcon: true
            }
        })) as unknown as ImportSubscriptionRow[]

        if (subscriptions.length === 0) return

        const categoryBySubscription = await this.loadInheritedCategories(
            userId,
            subscriptions.map(subscription => subscription.id)
        )

        for (const subscription of subscriptions) {
            const inherited = categoryBySubscription.get(subscription.id)
            const entry: ImportEnrichment = {
                subscriptionId: subscription.id,
                title: subscription.title,
                icon: subscription.appearanceLogoIcon,
                categoryId: inherited?.categoryId ?? null,
                subcategoryId: inherited?.subcategoryId ?? null
            }

            const titleKey = normalizeTitle(subscription.title)
            if (!titleKey) continue

            if (!this.byTitleKey.has(titleKey)) this.byTitleKey.set(titleKey, entry)

            const amountKey = buildAmountKey(subscription.title, subscription.amount, subscription.currency)
            if (!this.byAmountKey.has(amountKey)) this.byAmountKey.set(amountKey, entry)
        }
    }

    /**
     * Finds, for each subscription, the category its approved transactions were most often filed
     * under, so a recognised payment can inherit it.
     * @param userId The ID of the user who owns the transactions.
     * @param subscriptionIds The subscriptions to resolve a category for.
     * @returns A promise that resolves to the most frequent category per subscription.
     */
    private async loadInheritedCategories(
        userId: string,
        subscriptionIds: string[]
    ): Promise<Map<string, { categoryId: string; subcategoryId: string | null }>> {
        const grouped = await prisma.transaction.groupBy({
            by: ['subscriptionId', 'categoryId', 'subcategoryId'],
            where: {
                userId,
                status: 'APPROVED',
                deletedAt: null,
                subscriptionId: { in: subscriptionIds },
                categoryId: { not: null }
            },
            _count: { _all: true }
        })

        const best = new Map<string, { categoryId: string; subcategoryId: string | null; count: number }>()

        for (const row of grouped) {
            if (!row.subscriptionId || !row.categoryId) continue

            const current = best.get(row.subscriptionId)
            if (current && current.count >= row._count._all) continue

            best.set(row.subscriptionId, {
                categoryId: row.categoryId,
                subcategoryId: row.subcategoryId,
                count: row._count._all
            })
        }

        return new Map(
            [...best].map(([subscriptionId, { categoryId, subcategoryId }]) => [
                subscriptionId,
                { categoryId, subcategoryId }
            ])
        )
    }

    /**
     * Matches the candidate against the prepared subscriptions, preferring the merchant-and-amount
     * match over the merchant-only one.
     * @param candidate The candidate transaction being enriched.
     * @returns The enrichment carrying the subscription link, or null when nothing matches.
     */
    enrich(candidate: ImportCandidateTransaction): ImportEnrichmentResult | null {
        const titleKey = normalizeTitle(candidate.title)
        if (!titleKey) return null

        const match =
            this.byAmountKey.get(buildAmountKey(candidate.title, candidate.amount, candidate.currency)) ??
            this.byTitleKey.get(titleKey)

        if (!match) return null

        return { ...match, strategy: this.strategy }
    }
}
