import type { MarketDataAdapter, MarketDataCredentials } from '@poveroh/types'
import { MarketDataError } from '@poveroh/types'
import { YahooFinanceAdapter } from './adapters/yahoo-finance.adapter'
import { FinnhubAdapter } from './adapters/finnhub.adapter'
import { MassiveAdapter } from './adapters/massive.adapter'

/**
 * Factory that returns the adapter for a provider id, mirroring Beycloud's
 * `new BeyCloud(provider, config)`. Adding a provider is a single case here plus
 * a new adapter file; callers keep using the common MarketDataAdapter interface.
 * @param providerId The market data provider identifier.
 * @param credentials Optional plaintext credentials (required by credentialed providers).
 * @returns An adapter implementing the common interface.
 */
export function createMarketDataClient(providerId: string, credentials: MarketDataCredentials = {}): MarketDataAdapter {
    switch (providerId) {
        case 'yahoo-finance':
            return new YahooFinanceAdapter()
        case 'finnhub':
            return new FinnhubAdapter(requireApiKey(providerId, credentials))
        case 'massive':
            return new MassiveAdapter(requireApiKey(providerId, credentials))
        default:
            throw new MarketDataError(providerId, `Unknown market data provider: ${providerId}`)
    }
}

/**
 * Helper to enforce presence of an API key for credentialed providers, throwing a MarketDataError if missing.
 * @param providerId The market data provider identifier.
 * @param credentials The credentials object containing the API key.
 * @returns The API key if present.
 */
function requireApiKey(providerId: string, credentials: MarketDataCredentials): string {
    if (!credentials.apiKey) {
        throw new MarketDataError(providerId, `Provider "${providerId}" requires an API key`)
    }
    return credentials.apiKey
}
