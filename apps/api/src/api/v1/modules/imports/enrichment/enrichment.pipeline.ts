import { logger } from '@poveroh/logger/server'
import type {
    EnrichmentStrategyEnum,
    ImportCandidateTransaction,
    ImportEnrichment,
    ImportEnrichmentStrategy
} from '@poveroh/types'
import { HistoryStrategy } from './strategies/history.strategy'
import { RulesStrategy } from './strategies/rules.strategy'
import { SubscriptionStrategy } from './strategies/subscription.strategy'

/**
 * Runs every enrichment strategy over a batch of candidate transactions and merges what they
 * return, so an import arrives at review already categorized wherever the data allowed it.
 *
 * Strategies run in priority order and each field is filled by the first strategy that offers it:
 * a rule beats a subscription, which beats history. Merging per field rather than per transaction
 * means a subscription match can supply the link and the icon while history still supplies a
 * category the subscription had none for.
 *
 * Adding a way to categorize — the Rules module, an LLM pass — means implementing the strategy
 * interface and adding it to this list; nothing else in the import flow changes.
 */
export class EnrichmentPipeline {
    private readonly strategies: ImportEnrichmentStrategy[]

    constructor(strategies?: ImportEnrichmentStrategy[]) {
        this.strategies = [...(strategies ?? [new RulesStrategy(), new SubscriptionStrategy(), new HistoryStrategy()])]
        this.strategies.sort((a, b) => a.priority - b.priority)
    }

    /**
     * Enriches a whole batch at once, letting each strategy load what it needs in a single query
     * before any candidate is examined.
     * @param userId The ID of the user the imported transactions belong to.
     * @param candidates The normalized transactions to enrich.
     * @returns A promise that resolves to one enrichment per candidate, in the same order.
     */
    async run(userId: string, candidates: ImportCandidateTransaction[]): Promise<ImportEnrichment[]> {
        if (candidates.length === 0) return []

        await Promise.all(this.strategies.map(strategy => strategy.prepare(userId, candidates)))

        const contributions = new Map<EnrichmentStrategyEnum, number>()
        const enrichments = candidates.map(candidate => this.enrichOne(candidate, contributions))

        logger.info('Import enrichment completed', {
            userId,
            candidates: candidates.length,
            uncategorized: enrichments.filter(enrichment => !enrichment.categoryId).length,
            contributionsByStrategy: Object.fromEntries(contributions)
        })

        return enrichments
    }

    /**
     * Merges the strategies' results for a single candidate, first offer per field winning.
     * @param candidate The candidate transaction being enriched.
     * @param contributions Running tally of which strategies contributed, for the summary log.
     * @returns The merged enrichment for this candidate.
     */
    private enrichOne(
        candidate: ImportCandidateTransaction,
        contributions: Map<EnrichmentStrategyEnum, number>
    ): ImportEnrichment {
        const merged: ImportEnrichment = {}

        for (const strategy of this.strategies) {
            const result = strategy.enrich(candidate)
            if (!result) continue

            let contributed = false

            if (merged.title == null && result.title != null) {
                merged.title = result.title
                contributed = true
            }
            if (merged.categoryId == null && result.categoryId != null) {
                merged.categoryId = result.categoryId
                merged.subcategoryId = result.subcategoryId ?? null
                contributed = true
            }
            if (merged.subscriptionId == null && result.subscriptionId != null) {
                merged.subscriptionId = result.subscriptionId
                contributed = true
            }
            if (merged.icon == null && result.icon != null) {
                merged.icon = result.icon
                contributed = true
            }
            if (merged.note == null && result.note != null) {
                merged.note = result.note
                contributed = true
            }

            if (contributed) {
                contributions.set(strategy.strategy, (contributions.get(strategy.strategy) ?? 0) + 1)
            }
        }

        return merged
    }
}
