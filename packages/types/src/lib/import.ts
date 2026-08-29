import {
    TransactionActionEnum,
    CurrencyEnum,
    EnrichmentStrategyEnum,
    ImportCandidateTransaction,
    ImportEnrichmentResult,
    ImportSourceEnum
} from './contracts.js'

/**
 * One way of deriving a category, subcategory, subscription, icon or note for an imported
 * transaction. Strategies are ordered by priority and each one only contributes the fields the
 * higher-priority ones left empty.
 *
 * `prepare` receives the whole batch so a strategy loads everything it needs in a single query;
 * `enrich` is then pure and in-memory, which is what keeps the pipeline from issuing one query per
 * imported row. This is a behavioural contract, so it stays a hand-written interface rather than a
 * generated schema — its inputs and outputs are generated types.
 */
export interface ImportEnrichmentStrategy {
    readonly strategy: EnrichmentStrategyEnum
    readonly priority: number
    prepare(userId: string, candidates: ImportCandidateTransaction[]): Promise<void>
    enrich(candidate: ImportCandidateTransaction): ImportEnrichmentResult | null
}

/**
 * Produces the normalized transactions of an import from whatever its source persisted: the
 * uploaded files for a CSV import, the staged rows for a source that delivered them directly.
 *
 * This is what lets one processing path serve every source — the worker asks a reader rather than
 * branching on where the import came from. Like the strategy interface, it stays hand-written
 * because it describes behaviour; everything it exchanges is a generated type.
 */
export interface ImportSourceReader {
    readonly source: ImportSourceEnum
    read(importId: string): Promise<ImportCandidateTransaction[]>
}

/**
 * A past transaction as read by the history enrichment strategy. Amounts are typed as numbers
 * because the shared Prisma client converts every Decimal on the way out, which its generated
 * types do not reflect.
 */
export type ImportHistoryRow = {
    title: string
    categoryId: string | null
    subcategoryId: string | null
    icon: string | null
    note: string | null
    amounts: { amount: number; currency: CurrencyEnum }[]
}

/**
 * A subscription as read by the subscription enrichment strategy.
 */
export type ImportSubscriptionRow = {
    id: string
    title: string
    amount: number
    currency: CurrencyEnum
    appearanceLogoIcon: string
}

export type FieldMapping = {
    date?: string
    amount?: string
    currency?: string
    title?: string
    confidence: number
    dateFallbacks?: string[]
    amountFallbacks?: string[]
    currencyFallbacks?: string[]
    titleFallbacks?: string[]
}

export type ValueReturned = {
    transactions: ReadedTransaction[]
    mapping: FieldMapping
    errors: string[]
    detectedStartRow?: number
    summary: {
        totalTransactions: number
        totalIncome: number
        totalExpenses: number
    }
}

export type ReadedTransaction = {
    date: string
    amount: number
    action: TransactionActionEnum
    currency: CurrencyEnum
    title: string
    originalRow?: Record<string, any>
}
