import type {
    GetHistoricalQuotesParams,
    GetQuotesParams,
    HistoricalQuote,
    MarketDataAdapter,
    MarketInstrument,
    MarketQuote,
    SearchInstrumentsParams
} from '@poveroh/types'
import { MARKET_DATA_ENDPOINTS, MARKET_DATA_SEARCH_DEFAULT_LIMIT } from '@poveroh/types'
import type { DefaultApi, GetStocksAggregatesTimespanEnum } from '@massive.com/client-js'
import { mapAssetType, mapCurrency } from '../utils/mapping'
import { toMarketDataError } from '../utils/errors'

/**
 * Massive adapter backed by the official `@massive.com/client-js` REST client.
 * Requires an API key and uses the reference-tickers endpoint for search and the
 * last-trade endpoint for quotes.
 */
export class MassiveAdapter implements MarketDataAdapter {
    readonly providerId = 'massive'
    private clientPromise?: Promise<DefaultApi>

    constructor(private readonly apiKey: string) {}

    /**
     * Lazily imports the Massive client and initializes it with the API key and base URL.
     * @returns A promise that resolves to the initialized Massive REST client.
     */
    private getClient(): Promise<DefaultApi> {
        if (!this.clientPromise) {
            this.clientPromise = import('@massive.com/client-js').then(({ restClient }) =>
                restClient(this.apiKey, MARKET_DATA_ENDPOINTS.massive.base)
            )
        }

        return this.clientPromise
    }

    /**
     * Searches Massive's reference tickers endpoint and normalizes the results.
     * @param params The free-text query and optional result limit.
     * @returns The normalized list of instruments.
     */
    async searchInstruments(params: SearchInstrumentsParams): Promise<MarketInstrument[]> {
        try {
            const client = await this.getClient()
            const response = await client.listTickers({
                search: params.query,
                limit: params.limit ?? MARKET_DATA_SEARCH_DEFAULT_LIMIT,
                active: true
            })

            return (response.results ?? []).map(ticker => {
                const metadata: Record<string, string> = {}
                if (ticker.type) metadata.type = ticker.type

                return {
                    providerId: this.providerId,
                    providerInstrumentId: ticker.ticker,
                    symbol: ticker.ticker,
                    displayName: ticker.name || ticker.ticker,
                    assetType: mapAssetType(ticker.type || ticker.market),
                    currency: mapCurrency(ticker.currency_symbol || ticker.currency_name),
                    exchange: ticker.primary_exchange || null,
                    market: ticker.market || null,
                    metadata
                }
            })
        } catch (error) {
            throw toMarketDataError(this.providerId, error)
        }
    }

    /**
     * Resolves quotes via Massive's previous-day aggregate endpoint, one request per symbol.
     * @param params The symbols to resolve.
     * @returns The normalized list of quotes.
     */
    async getQuotes(params: GetQuotesParams): Promise<MarketQuote[]> {
        const quotes = await Promise.all(params.symbols.map(symbol => this.getQuote(symbol)))
        return quotes.filter((quote): quote is MarketQuote => quote !== null)
    }

    /**
     * Fetches and normalizes a single symbol quote, returning null when no price is available.
     * @param symbol The symbol to fetch.
     * @returns The normalized quote or null if unavailable.
     */
    private async getQuote(symbol: string): Promise<MarketQuote | null> {
        try {
            const client = await this.getClient()

            const response = await client.getPreviousStocksAggregates({ stocksTicker: symbol })
            const aggregate = response.results?.[0]
            const price = aggregate?.c
            if (typeof price !== 'number') return null

            const timestamp = aggregate?.t

            return {
                providerId: this.providerId,
                symbol,
                assetType: 'STOCK',
                currency: 'USD',
                price,
                changePercent: null,
                marketState: 'UNKNOWN',
                asOf: typeof timestamp === 'number' ? new Date(timestamp).toISOString() : new Date().toISOString(),
                valueSource: 'MARKET',
                displayName: null,
                exchange: null,
                market: null
            }
        } catch (error) {
            throw toMarketDataError(this.providerId, error)
        }
    }

    /**
     * Fetches a daily historical close-price series via Massive's aggregates endpoint.
     * @param params The symbol and the from/to date range to fetch.
     * @returns The normalized list of historical daily quotes.
     */
    async getHistoricalQuotes(params: GetHistoricalQuotesParams): Promise<HistoricalQuote[]> {
        try {
            const client = await this.getClient()
            const response = await client.getStocksAggregates({
                stocksTicker: params.symbol,
                multiplier: 1,
                timespan: 'day' as GetStocksAggregatesTimespanEnum,
                from: params.from,
                to: params.to
            })

            return (response.results ?? [])
                .filter((result): result is typeof result & { c: number; t: number } => typeof result.c === 'number')
                .map(result => ({
                    date: new Date(result.t).toISOString().slice(0, 10),
                    close: result.c
                }))
        } catch (error) {
            throw toMarketDataError(this.providerId, error)
        }
    }
}
