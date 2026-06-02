import type {
    GetQuotesParams,
    MarketDataAdapter,
    MarketInstrument,
    MarketQuote,
    SearchInstrumentsParams
} from '@poveroh/types'
import { MARKET_DATA_SEARCH_DEFAULT_LIMIT } from '@poveroh/types'
import YahooFinance from 'yahoo-finance2'
import { mapAssetType, mapCurrency, mapMarketState } from '../utils/mapping'
import { toMarketDataError } from '../utils/errors'
import type { YahooSearchQuoteLike } from '../types/yahoo-finance.types'

/**
 * Yahoo Finance adapter backed by the `yahoo-finance2` client, which handles the
 * cookie/crumb auth handshake and response validation that raw HTTP would miss.
 * Requires no credentials, so it is the default provider and works out of the box.
 */
export class YahooFinanceAdapter implements MarketDataAdapter {
    readonly providerId = 'yahoo-finance'
    private readonly client = new YahooFinance()

    /**
     * Searches Yahoo's autocomplete endpoint and normalizes the symbol-bearing quotes.
     * @param params The free-text query and optional result limit.
     * @returns The normalized list of instruments.
     */
    async searchInstruments(params: SearchInstrumentsParams): Promise<MarketInstrument[]> {
        try {
            const result = await this.client.search(params.query, {
                quotesCount: params.limit ?? MARKET_DATA_SEARCH_DEFAULT_LIMIT,
                newsCount: 0
            })

            // Search results mix Yahoo instruments with editorial entries; keep only the symbol-bearing ones.
            return (result.quotes as YahooSearchQuoteLike[])
                .filter((quote): quote is YahooSearchQuoteLike & { symbol: string } => Boolean(quote.symbol))
                .map(quote => ({
                    providerId: this.providerId,
                    providerInstrumentId: quote.symbol,
                    symbol: quote.symbol,
                    displayName: quote.longname || quote.shortname || quote.symbol,
                    assetType: mapAssetType(quote.quoteType),
                    currency: mapCurrency(undefined),
                    exchange: quote.exchDisp || quote.exchange || null,
                    market: quote.exchange || null,
                    metadata: {}
                }))
        } catch (error) {
            throw toMarketDataError(this.providerId, error)
        }
    }

    /**
     * Resolves quotes through the client's quote endpoint, one request per symbol.
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
        try {
            const quote = await this.client.quote(symbol)
            if (!quote || typeof quote.regularMarketPrice !== 'number') return null

            return {
                providerId: this.providerId,
                symbol: quote.symbol || symbol,
                assetType: mapAssetType(quote.quoteType),
                currency: mapCurrency(quote.currency),
                price: quote.regularMarketPrice,
                changePercent:
                    typeof quote.regularMarketChangePercent === 'number' ? quote.regularMarketChangePercent : null,
                marketState: mapMarketState(quote.marketState),
                asOf: new Date().toISOString(),
                valueSource: 'MARKET',
                displayName: quote.longName || quote.shortName || null,
                exchange: quote.fullExchangeName || quote.exchange || null,
                market: quote.exchange || null
            }
        } catch (error) {
            throw toMarketDataError(this.providerId, error)
        }
    }
}
