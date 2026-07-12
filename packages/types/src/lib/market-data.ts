import type { AssetTypeEnum, MarketInstrument, MarketQuote } from './contracts.js'

/**
 * Parameters accepted by an adapter when searching for instruments.
 * `query` is the free-text the user typed (ISIN, ticker, name, crypto, ...).
 */
export type SearchInstrumentsParams = {
    query: string
    assetType?: AssetTypeEnum
    limit?: number
}

/**
 * Parameters accepted by an adapter when resolving live quotes for one or more symbols.
 */
export type GetQuotesParams = {
    symbols: string[]
    assetType?: AssetTypeEnum
}

/**
 * Parameters accepted by an adapter when resolving a historical daily close-price series for a symbol.
 */
export type GetHistoricalQuotesParams = {
    symbol: string
    from: string
    to: string
}

/**
 * A single day's closing price in a historical quote series.
 */
export type HistoricalQuote = {
    date: string
    close: number
}

/**
 * Plaintext credentials handed to an adapter. Optional because some providers
 * (e.g. Yahoo Finance) do not require authentication.
 */
export type MarketDataCredentials = {
    apiKey?: string
}

/**
 * Common interface every provider adapter implements. The market-data factory
 * returns one of these, so callers never depend on a concrete provider.
 */
export interface MarketDataAdapter {
    readonly providerId: string
    searchInstruments(params: SearchInstrumentsParams): Promise<MarketInstrument[]>
    getQuotes(params: GetQuotesParams): Promise<MarketQuote[]>
    getHistoricalQuotes(params: GetHistoricalQuotesParams): Promise<HistoricalQuote[]>
}

/**
 * Error thrown for any provider-side failure (unknown provider, missing
 * credentials, upstream HTTP error or unparseable payload). The API layer maps
 * this onto an HttpError so the original provider context is preserved.
 */
export class MarketDataError extends Error {
    constructor(
        public readonly providerId: string,
        message: string,
        public readonly statusCode?: number
    ) {
        super(message)
        this.name = 'MarketDataError'
    }
}

export const MARKET_DATA_SEARCH_MIN_QUERY_LENGTH = 2
export const MARKET_DATA_SEARCH_DEFAULT_LIMIT = 20
export const MARKET_DATA_REQUEST_TIMEOUT_MS = 8000

// Yahoo and Massive talk through their official SDKs; only Finnhub uses raw HTTP, plus
// the Massive REST base passed to its client.
export const MARKET_DATA_ENDPOINTS = {
    finnhub: {
        base: 'https://finnhub.io/api/v1'
    },
    massive: {
        base: 'https://api.massive.com'
    }
} as const
