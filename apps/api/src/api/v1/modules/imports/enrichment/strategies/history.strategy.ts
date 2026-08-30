import prisma from '@poveroh/prisma'
import { logger } from '@poveroh/logger/server'
import type {
    EnrichmentStrategyEnum,
    ImportCandidateTransaction,
    ImportEnrichment,
    ImportEnrichmentResult,
    ImportEnrichmentStrategy,
    ImportHistoryRow
} from '@poveroh/types'
import { buildAmountKey, normalizeTitle } from '../../../../utils/normalize-title'

// How many past transactions are indexed for one import. A personal finance history is well below
// this, and the query only selects five columns, but the cap keeps a pathological account from
// pulling an unbounded result set into memory. Hitting it is logged rather than passed over in
// silence, since it means the oldest history stopped contributing to categorization.
const HISTORY_LOOKBACK_LIMIT = 10_000

/**
 * Derives a category from how the user categorized the same merchant before. Matching happens at
 * two levels: same merchant and same amount (a recurring, identical payment, which also carries the
 * note over), then same merchant alone (a variable-amount payment, where only the category travels).
 */
export class HistoryStrategy implements ImportEnrichmentStrategy {
    readonly strategy: EnrichmentStrategyEnum = 'HISTORY'
    readonly priority = 30

    private readonly byAmountKey = new Map<string, ImportEnrichment>()
    private readonly byTitleKey = new Map<string, ImportEnrichment>()

    /**
     * Indexes the user's approved transactions by merchant key so every candidate is matched in
     * memory, replacing the per-row lookups the import used to issue.
     * @param userId The ID of the user whose history is being indexed.
     * @param candidates The batch being imported, used to skip the work when it is empty.
     * @returns A promise that resolves once the in-memory index is built.
     */
    async prepare(userId: string, candidates: ImportCandidateTransaction[]): Promise<void> {
        this.byAmountKey.clear()
        this.byTitleKey.clear()

        if (candidates.length === 0) return

        const history = (await prisma.transaction.findMany({
            where: { userId, status: 'APPROVED', deletedAt: null },
            select: {
                title: true,
                categoryId: true,
                subcategoryId: true,
                icon: true,
                note: true,
                amounts: { select: { amount: true, currency: true } }
            },
            orderBy: { date: 'desc' },
            take: HISTORY_LOOKBACK_LIMIT
        })) as unknown as ImportHistoryRow[]

        if (history.length === HISTORY_LOOKBACK_LIMIT) {
            logger.info('Import enrichment indexed a truncated transaction history', {
                userId,
                limit: HISTORY_LOOKBACK_LIMIT
            })
        }

        // Walked newest first, and existing keys are never overwritten, so the most recent
        // categorization of a merchant is the one that wins.
        for (const transaction of history) {
            const entry: ImportEnrichment = {
                categoryId: transaction.categoryId,
                subcategoryId: transaction.subcategoryId,
                icon: transaction.icon,
                note: transaction.note,
                title: transaction.title
            }

            const titleKey = normalizeTitle(transaction.title)
            if (!titleKey) continue

            if (!this.byTitleKey.has(titleKey)) this.byTitleKey.set(titleKey, entry)

            for (const amount of transaction.amounts) {
                const amountKey = buildAmountKey(transaction.title, amount.amount, amount.currency)
                if (!this.byAmountKey.has(amountKey)) this.byAmountKey.set(amountKey, entry)
            }
        }
    }

    /**
     * Looks the candidate up in the prepared index, preferring the merchant-and-amount match.
     * @param candidate The candidate transaction being enriched.
     * @returns The enrichment derived from history, or null when the merchant was never seen.
     */
    enrich(candidate: ImportCandidateTransaction): ImportEnrichmentResult | null {
        const titleKey = normalizeTitle(candidate.title)
        if (!titleKey) return null

        const exact = this.byAmountKey.get(buildAmountKey(candidate.title, candidate.amount, candidate.currency))
        if (exact) return { ...exact, strategy: this.strategy }

        const sameMerchant = this.byTitleKey.get(titleKey)
        if (!sameMerchant) return null

        // A different amount means a different payment, so its note would not apply here.
        return { ...sameMerchant, strategy: this.strategy, note: null }
    }
}
