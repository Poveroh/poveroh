import type {
    EnrichmentStrategyEnum,
    ImportCandidateTransaction,
    ImportEnrichmentResult,
    ImportEnrichmentStrategy
} from '@poveroh/types'

/**
 * Placeholder for the user-defined rules the Rules module will let people build from the UI
 * ("anything from ACME goes to Groceries"). It is registered at the highest priority because an
 * explicit rule must always win over anything the other strategies infer.
 *
 * It contributes nothing until that module exists; wiring it now fixes the contract, so landing
 * Rules means implementing these two methods and nothing else.
 */
export class RulesStrategy implements ImportEnrichmentStrategy {
    readonly strategy: EnrichmentStrategyEnum = 'RULE'
    readonly priority = 10

    /**
     * Loads the user's rules for the batch. No-op until the Rules module lands.
     * @returns A promise that resolves immediately.
     */
    async prepare(): Promise<void> {}

    /**
     * Applies the matching rule to a candidate. Always null until the Rules module lands.
     * @param _candidate The candidate transaction being enriched.
     * @returns Null, since no rules exist yet.
     */
    enrich(_candidate: ImportCandidateTransaction): ImportEnrichmentResult | null {
        return null
    }
}
