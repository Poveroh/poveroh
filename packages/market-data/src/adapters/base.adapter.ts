import type {
    GetQuotesParams,
    MarketDataAdapter,
    MarketInstrument,
    MarketQuote,
    SearchInstrumentsParams
} from '@poveroh/types'
import { MARKET_DATA_REQUEST_TIMEOUT_MS } from '@poveroh/types'
import axios from 'axios'
import { toMarketDataError } from '../utils/errors'

/**
 * Shared behaviour for HTTP-based provider adapters: a JSON GET helper with a
 * request timeout and consistent error normalization to MarketDataError.
 */
export abstract class BaseHttpAdapter implements MarketDataAdapter {
    abstract readonly providerId: string

    abstract searchInstruments(params: SearchInstrumentsParams): Promise<MarketInstrument[]>
    abstract getQuotes(params: GetQuotesParams): Promise<MarketQuote[]>

    /**
     * Performs a GET request and returns the parsed JSON body, wrapping any transport,
     * status or parse failure into a MarketDataError tagged with the provider id.
     * @param url The fully-built request URL.
     * @param headers Optional request headers (e.g. User-Agent, Authorization).
     * @returns The parsed JSON payload typed as T.
     */
    protected async fetchJson<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
        try {
            const response = await axios.get<T>(url, {
                headers,
                timeout: MARKET_DATA_REQUEST_TIMEOUT_MS
            })

            return response.data
        } catch (error) {
            throw toMarketDataError(this.providerId, error)
        }
    }
}
