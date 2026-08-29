import type { BankSyncProvider } from '@poveroh/types'

type BankSyncProviderDefinition = Omit<BankSyncProvider, 'connectionCount' | 'configured'>

export const BANK_SYNC_PROVIDER_REGISTRY: ReadonlyArray<BankSyncProviderDefinition> = [
    {
        id: 'plaid',
        label: 'Plaid',
        logoUrl:
            'https://www.logo.dev/_next/image?url=https%3A%2F%2Fimg.logo.dev%2Fplaid.com%3Ftoken%3Dlive_6a1a28fd-6420-4492-aeb0-b297461d9de2%26size%3D128%26retina%3Dtrue%26format%3Dpng&w=640&q=75',
        kind: 'aggregator',
        connectFlow: 'hosted',
        connectMechanism: 'widget',
        credentialFields: [],
        appCredentialFields: [
            { key: 'clientId', label: 'Client ID' },
            { key: 'secret', label: 'Secret', secret: true },
            { key: 'env', label: 'Environment (sandbox or production)' }
        ],
        enabled: true
    },
    {
        id: 'lunchflow',
        label: 'Lunch Flow',
        logoUrl:
            'https://www.logo.dev/_next/image?url=https%3A%2F%2Fimg.logo.dev%2Flunchflow.app%3Ftoken%3Dlive_6a1a28fd-6420-4492-aeb0-b297461d9de2%26size%3D128%26retina%3Dtrue%26format%3Dpng&w=640&q=75',
        kind: 'aggregator',
        connectFlow: 'hosted',
        connectMechanism: 'widget',
        credentialFields: [],
        appCredentialFields: [{ key: 'apiKey', label: 'API Key', secret: true }],
        enabled: true
    }
] as const

/**
 * Returns the provider definition for the given provider id, or undefined if not found.
 * @param providerId The provider id to look up.
 * @returns The provider definition, or undefined if not found.
 */
export function getBankSyncProviderDefinition(providerId: string): BankSyncProviderDefinition | undefined {
    return BANK_SYNC_PROVIDER_REGISTRY.find(provider => provider.id === providerId)
}

/**
 * Checks if the given provider id is known (registered) in the system.
 * @param providerId The provider id to check.
 * @returns True if the provider is known, false otherwise.
 */
export function isKnownBankSyncProvider(providerId: string): boolean {
    return getBankSyncProviderDefinition(providerId) !== undefined
}
