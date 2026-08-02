import type { AssetTypeEnum, MarketDataProvider } from '@poveroh/types'

type MarketDataProviderDefinition = Omit<MarketDataProvider, 'configured'> & {
    credentialFields: ReadonlyArray<{ key: string; label: string }>
}

export const MARKET_DATA_PROVIDER_REGISTRY: ReadonlyArray<MarketDataProviderDefinition> = [
    {
        id: 'yahoo-finance',
        label: 'Yahoo Finance',
        logoUrl:
            'https://www.logo.dev/_next/image?url=https%3A%2F%2Fimg.logo.dev%2Fyahoo.com%3Ftoken%3Dlive_6a1a28fd-6420-4492-aeb0-b297461d9de2%26size%3D128%26retina%3Dtrue%26format%3Dpng&w=640&q=75',
        transport: 'HTTP',
        enabled: true,
        requiresCredentials: false,
        supportsSearch: true,
        supportsQuotes: true,
        supportsStreaming: false,
        supportedAssetTypes: ['STOCK', 'ETF', 'CRYPTO', 'MUTUAL_FUND'] satisfies AssetTypeEnum[],
        credentialFields: []
    },
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
        supportedAssetTypes: ['STOCK', 'ETF', 'CRYPTO'] satisfies AssetTypeEnum[],
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
        supportedAssetTypes: ['STOCK', 'ETF', 'BOND', 'CRYPTO'] satisfies AssetTypeEnum[],
        credentialFields: [{ key: 'apiKey', label: 'Api key' }]
    }
] as const

/**
 * Returns the provider definition for the given provider id, or undefined if not found.
 * @param providerId The provider id to look up.
 * @returns The provider definition, or undefined if not found.
 */
export function getProviderDefinition(providerId: string): MarketDataProviderDefinition | undefined {
    return MARKET_DATA_PROVIDER_REGISTRY.find(provider => provider.id === providerId)
}

/**
 * Checks if the given provider id is known (registered) in the system.
 * @param providerId The provider id to check.
 * @returns True if the provider is known, false otherwise.
 */
export function isKnownProvider(providerId: string): boolean {
    return getProviderDefinition(providerId) !== undefined
}
