import type {
    GetHistoricalQuotesParams,
    GetQuotesParams,
    HistoricalQuote,
    MarketInstrument,
    MarketQuote,
    SearchInstrumentsParams
} from '@poveroh/types'
import { MarketDataError, MARKET_DATA_ENDPOINTS, MARKET_DATA_SEARCH_DEFAULT_LIMIT } from '@poveroh/types'
import { BaseHttpAdapter } from './base.adapter'
import { mapAssetType } from '../utils/mapping'
import type { FinnhubSearchResult, FinnhubSearchResponse, FinnhubQuoteResponse } from '../types/finnhub.types'

const BASE_URL = MARKET_DATA_ENDPOINTS.finnhub.base

/**
 * Finnhub adapter. Requires an API key (passed as the `token` query parameter)
 * and supports symbol lookup by ticker, company name, ISIN or CUSIP.
 */
export class FinnhubAdapter extends BaseHttpAdapter {
    readonly providerId = 'finnhub'

    constructor(private readonly apiKey: string) {
        super()
    }

    /**
     * Searches Finnhub's symbol-lookup endpoint and normalizes the results.
     * @param params The free-text query and optional result limit.
     * @returns The normalized list of instruments.
     */
    async searchInstruments(params: SearchInstrumentsParams): Promise<MarketInstrument[]> {
        const url = new URL(`${BASE_URL}/search`)
        url.searchParams.set('q', params.query)
        url.searchParams.set('token', this.apiKey)

        const data = await this.fetchJson<FinnhubSearchResponse>(url.toString())
        const limit = params.limit ?? MARKET_DATA_SEARCH_DEFAULT_LIMIT

        return (data.result ?? [])
            .filter((result): result is FinnhubSearchResult & { symbol: string } => Boolean(result.symbol))
            .slice(0, limit)
            .map(result => {
                const metadata: Record<string, string> = {}
                if (result.type) metadata.type = result.type

                return {
                    providerId: this.providerId,
                    providerInstrumentId: result.symbol,
                    symbol: result.symbol,
                    displayName: result.description || result.displaySymbol || result.symbol,
                    assetType: mapAssetType(result.type),
                    // Finnhub's search payload does not carry a currency; default to USD.
                    currency: 'USD',
                    exchange: null,
                    market: null,
                    metadata
                }
            })
    }

    /**
     * Resolves quotes via Finnhub's `quote` endpoint, one request per symbol.
     * @param params The symbols to resolve.
     * @returns The normalized list of quotes.
     */
    async getQuotes(params: GetQuotesParams): Promise<MarketQuote[]> {
        const quotes = await Promise.all(params.symbols.map(symbol => this.getQuote(symbol)))
        return quotes.filter((quote): quote is MarketQuote => quote !== null)
    }

    // Fetches and normalizes a single symbol quote, returning null when no price is available.
    private async getQuote(symbol: string): Promise<MarketQuote | null> {
        if (!this.apiKey) throw new MarketDataError(this.providerId, 'Missing Finnhub API key')

        const url = new URL(`${BASE_URL}/quote`)
        url.searchParams.set('symbol', symbol)
        url.searchParams.set('token', this.apiKey)

        const data = await this.fetchJson<FinnhubQuoteResponse>(url.toString())
        if (typeof data.c !== 'number' || data.c === 0) return null

        return {
            providerId: this.providerId,
            symbol,
            assetType: 'STOCK',
            currency: 'USD',
            price: data.c,
            changePercent: typeof data.dp === 'number' ? data.dp : null,
            marketState: 'UNKNOWN',
            asOf: data.t ? new Date(data.t * 1000).toISOString() : new Date().toISOString(),
            valueSource: 'MARKET',
            displayName: null,
            exchange: null,
            market: null
        }
    }

    /**
     * Historical daily quotes require Finnhub's `/stock/candle` endpoint, which is gated
     * behind paid plans on most API keys, so it is not supported by this adapter.
     * @param _params Unused.
     */
    async getHistoricalQuotes(_params: GetHistoricalQuotesParams): Promise<HistoricalQuote[]> {
        throw new MarketDataError(this.providerId, 'Historical quotes are not supported by the Finnhub provider')
    }
}
