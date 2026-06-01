import type { GetQuotesParams, MarketInstrument, MarketQuote, SearchInstrumentsParams } from '@poveroh/types'
import { MARKET_DATA_ENDPOINTS, MARKET_DATA_SEARCH_DEFAULT_LIMIT, YAHOO_FINANCE_REQUEST_HEADERS } from '@poveroh/types'
import { BaseHttpAdapter } from './base.adapter'
import { mapAssetType, mapCurrency, mapMarketState } from '../utils/mapping'
import type { YahooSearchQuote, YahooSearchResponse, YahooChartResponse } from '../types/yahoo-finance.types'

const SEARCH_URL = MARKET_DATA_ENDPOINTS.yahooFinance.search
const CHART_URL = MARKET_DATA_ENDPOINTS.yahooFinance.chart

/**
 * Yahoo Finance adapter. Requires no credentials, so it is the default provider
 * and works out of the box for instrument search and chart-based quotes.
 */
export class YahooFinanceAdapter extends BaseHttpAdapter {
    readonly providerId = 'yahoo-finance'

    /**
     * Searches Yahoo's autocomplete endpoint and normalizes the equity-like quotes.
     * @param params The free-text query and optional result limit.
     * @returns The normalized list of instruments.
     */
    async searchInstruments(params: SearchInstrumentsParams): Promise<MarketInstrument[]> {
        const url = new URL(SEARCH_URL)
        url.searchParams.set('q', params.query)
        url.searchParams.set('quotesCount', String(params.limit ?? MARKET_DATA_SEARCH_DEFAULT_LIMIT))
        url.searchParams.set('newsCount', '0')

        const data = await this.fetchJson<YahooSearchResponse>(url.toString(), YAHOO_FINANCE_REQUEST_HEADERS)

        return (data.quotes ?? [])
            .filter((quote): quote is YahooSearchQuote & { symbol: string } => Boolean(quote.symbol))
            .map(quote => ({
                providerId: this.providerId,
                providerInstrumentId: quote.symbol,
                symbol: quote.symbol,
                displayName: quote.longname || quote.shortname || quote.symbol,
                assetType: mapAssetType(quote.quoteType),
                currency: mapCurrency(quote.currency),
                exchange: quote.exchDisp || quote.exchange || null,
                market: quote.exchange || null,
                metadata: {}
            }))
    }

    /**
     * Resolves quotes by reading the chart endpoint `meta` block for each symbol.
     * @param params The symbols to resolve.
     * @returns The normalized list of quotes.
     */
    async getQuotes(params: GetQuotesParams): Promise<MarketQuote[]> {
        const quotes = await Promise.all(params.symbols.map(symbol => this.getQuote(symbol)))
        return quotes.filter((quote): quote is MarketQuote => quote !== null)
    }

    /**
     * Fetches and normalizes a single symbol quote, returning null when unavailable.
     * @param symbol The symbol to fetch.
     * @returns The normalized quote or null if unavailable.
     */
    private async getQuote(symbol: string): Promise<MarketQuote | null> {
        const url = new URL(`${CHART_URL}/${encodeURIComponent(symbol)}`)
        url.searchParams.set('range', '1d')
        url.searchParams.set('interval', '1d')

        const data = await this.fetchJson<YahooChartResponse>(url.toString(), YAHOO_FINANCE_REQUEST_HEADERS)
        const meta = data.chart?.result?.[0]?.meta
        if (!meta || typeof meta.regularMarketPrice !== 'number') return null

        const previousClose = meta.previousClose ?? meta.chartPreviousClose
        const changePercent =
            typeof previousClose === 'number' && previousClose !== 0
                ? ((meta.regularMarketPrice - previousClose) / previousClose) * 100
                : null

        return {
            providerId: this.providerId,
            symbol: meta.symbol || symbol,
            assetType: 'STOCK',
            currency: mapCurrency(meta.currency),
            price: meta.regularMarketPrice,
            changePercent,
            marketState: mapMarketState(meta.marketState),
            asOf: new Date().toISOString(),
            valueSource: 'MARKET',
            displayName: null,
            exchange: meta.fullExchangeName || meta.exchangeName || null,
            market: meta.exchangeName || null
        }
    }
}
