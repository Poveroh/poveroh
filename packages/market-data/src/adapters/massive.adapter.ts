import type { GetQuotesParams, MarketInstrument, MarketQuote, SearchInstrumentsParams } from '@poveroh/types'
import { MarketDataError, MARKET_DATA_ENDPOINTS, MARKET_DATA_SEARCH_DEFAULT_LIMIT } from '@poveroh/types'
import { BaseHttpAdapter } from './base.adapter'
import { mapAssetType, mapCurrency } from '../utils/mapping'
import type { MassiveTicker, MassiveTickersResponse, MassiveLastTradeResponse } from '../types/massive.types'

const BASE_URL = MARKET_DATA_ENDPOINTS.massive.base

/**
 * Massive adapter (Polygon.io-compatible REST API). Requires an API key, passed
 * as the `apiKey` query parameter — the convention Massive inherits from Polygon.
 * If a deployment uses bearer auth instead, only `authParams()` needs to change.
 */
export class MassiveAdapter extends BaseHttpAdapter {
    readonly providerId = 'massive'

    constructor(private readonly apiKey: string) {
        super()
    }

    /**
     * Attaches the API key to the request URL.
     * @param url The URL to modify.
     */
    private authParams(url: URL): void {
        url.searchParams.set('apiKey', this.apiKey)
    }

    /**
     * Searches Massive's reference tickers endpoint and normalizes the results.
     * @param params The free-text query and optional result limit.
     * @returns The normalized list of instruments.
     */
    async searchInstruments(params: SearchInstrumentsParams): Promise<MarketInstrument[]> {
        if (!this.apiKey) throw new MarketDataError(this.providerId, 'Missing Massive API key')

        const url = new URL(`${BASE_URL}/v3/reference/tickers`)
        url.searchParams.set('search', params.query)
        url.searchParams.set('limit', String(params.limit ?? MARKET_DATA_SEARCH_DEFAULT_LIMIT))
        this.authParams(url)

        const data = await this.fetchJson<MassiveTickersResponse>(url.toString())

        return (data.results ?? [])
            .filter((ticker): ticker is MassiveTicker & { ticker: string } => Boolean(ticker.ticker))
            .map(ticker => {
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
    }

    /**
     * Resolves quotes via Massive's last-trade endpoint, one request per symbol.
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
        if (!this.apiKey) throw new MarketDataError(this.providerId, 'Missing Massive API key')

        const url = new URL(`${BASE_URL}/v2/last/trade/${encodeURIComponent(symbol)}`)
        this.authParams(url)

        const data = await this.fetchJson<MassiveLastTradeResponse>(url.toString())
        const price = data.results?.p
        if (typeof price !== 'number') return null

        return {
            providerId: this.providerId,
            symbol,
            assetType: 'STOCK',
            currency: 'USD',
            price,
            changePercent: null,
            marketState: 'UNKNOWN',
            asOf: data.results?.t ? new Date(data.results.t / 1_000_000).toISOString() : new Date().toISOString(),
            valueSource: 'MARKET',
            displayName: null,
            exchange: null,
            market: null
        }
    }
}
