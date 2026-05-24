import type { AssetTypeEnum, MarketDataProvider } from '@poveroh/types'

// Static registry of supported market data providers. Adding a new provider means
// appending an entry here. The actual fetch/streaming logic will plug in when
// we wire up price retrieval; for now only the configuration metadata is needed.
type MarketDataProviderDefinition = Omit<MarketDataProvider, 'configured'> & {
    credentialFields: ReadonlyArray<{ key: string; label: string }>
}

export const MARKET_DATA_PROVIDER_REGISTRY: ReadonlyArray<MarketDataProviderDefinition> = [
    {
        id: 'finnhub',
        label: 'Finnhub',
        logoUrl:
            'https://www.logo.dev/_next/image?url=https%3A%2F%2Fimg.logo.dev%2Ffinnhub.io%3Ftoken%3Dlive_6a1a28fd-6420-4492-aeb0-b297461d9de2%26size%3D128%26retina%3Dtrue%26format%3Dpng&w=640&q=75',
        transport: 'HTTP',
        enabled: true,
        requiresCredentials: true,
        supportsSearch: true,
        supportsQuotes: true,
        supportsStreaming: false,
        supportedAssetTypes: ['STOCK', 'ETF', 'CRYPTOCURRENCY'] satisfies AssetTypeEnum[],
        credentialFields: [{ key: 'apiKey', label: 'Api key' }]
    },
    {
        id: 'massive',
        label: 'Massive',
        logoUrl:
            'https://www.logo.dev/_next/image?url=https%3A%2F%2Fimg.logo.dev%2Fmassive.com%3Ftoken%3Dlive_6a1a28fd-6420-4492-aeb0-b297461d9de2%26size%3D128%26retina%3Dtrue%26format%3Dpng&w=640&q=75',
        transport: 'HTTP',
        enabled: true,
        requiresCredentials: true,
        supportsSearch: true,
        supportsQuotes: true,
        supportsStreaming: false,
        supportedAssetTypes: ['STOCK', 'ETF', 'BOND', 'CRYPTOCURRENCY'] satisfies AssetTypeEnum[],
        credentialFields: [{ key: 'apiKey', label: 'Api key' }]
    }
] as const

// Returns the provider definition for an id, or undefined if the id is unknown.
export function getProviderDefinition(providerId: string): MarketDataProviderDefinition | undefined {
    return MARKET_DATA_PROVIDER_REGISTRY.find(provider => provider.id === providerId)
}

// Returns true when the given id is a registered provider.
export function isKnownProvider(providerId: string): boolean {
    return getProviderDefinition(providerId) !== undefined
}
