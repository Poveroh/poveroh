import type {
    GetQuotesParams,
    MarketDataAdapter,
    MarketInstrument,
    MarketQuote,
    SearchInstrumentsParams
} from '@poveroh/types'
import { MarketDataError, MARKET_DATA_REQUEST_TIMEOUT_MS } from '@poveroh/types'
import axios from 'axios'

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
            if (error instanceof MarketDataError) throw error

            if (axios.isAxiosError(error)) {
                throw new MarketDataError(this.providerId, error.message, error.response?.status)
            }

            const message = error instanceof Error ? error.message : 'Unknown provider error'
            throw new MarketDataError(this.providerId, message)
        }
    }
}
