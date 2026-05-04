import type { AssetTypeEnum, MarketDataProvider, MarketInstrument, MarketQuote } from '@poveroh/types'
import prisma from '@poveroh/prisma'

import { BadRequestError } from '@/src/utils'
import { BaseService } from './base.service'
import { MARKET_DATA_PROVIDER_REGISTRY, getProviderDefinition } from '../content/template/market-data-providers'

type SearchMarketInstrumentsParams = {
    providerId?: string
    assetType?: AssetTypeEnum
    q: string
    limit?: number
}

type GetMarketQuotesParams = {
    providerId?: string
    assetType?: AssetTypeEnum
    symbols: string[]
}

// Service that exposes provider metadata and (future) market data fetching.
// User-scoped because the `configured` flag depends on which credentials the user has stored.
export class MarketDataService extends BaseService {
    constructor(userId: string) {
        super(userId, 'market-data')
    }

    // Returns the static registry enriched with a per-user `configured` flag.
    async getProviders(): Promise<MarketDataProvider[]> {
        const userId = this.getUserId()
        const configuredRows = await prisma.marketDataProviderCredential.findMany({
            where: { userId },
            select: { providerId: true }
        })
        const configuredIds = new Set(configuredRows.map(row => row.providerId))

        return MARKET_DATA_PROVIDER_REGISTRY.map(provider => ({
            id: provider.id,
            label: provider.label,
            logoUrl: provider.logoUrl,
            transport: provider.transport,
            enabled: provider.enabled,
            configured: configuredIds.has(provider.id),
            requiresCredentials: provider.requiresCredentials,
            supportsSearch: provider.supportsSearch,
            supportsQuotes: provider.supportsQuotes,
            supportsStreaming: provider.supportsStreaming,
            supportedAssetTypes: [...provider.supportedAssetTypes]
        }))
    }

    // Placeholder while provider clients are not yet implemented. Will be wired up alongside
    // the investments fetch flow; until then we surface a 400 so it is obvious the call is unsupported.
    async searchInstruments(_params: SearchMarketInstrumentsParams): Promise<MarketInstrument[]> {
        this.assertProviderRegistered(_params.providerId)
        throw new BadRequestError('Market data fetching is not implemented yet for the configured providers')
    }

    // Placeholder, see comment on searchInstruments.
    async getQuotes(params: GetMarketQuotesParams): Promise<MarketQuote[]> {
        if (params.symbols.length === 0) {
            throw new BadRequestError('At least one symbol is required')
        }

        this.assertProviderRegistered(params.providerId)
        throw new BadRequestError('Market data fetching is not implemented yet for the configured providers')
    }

    // Validates that an explicitly requested providerId exists in the registry.
    private assertProviderRegistered(providerId?: string): void {
        if (!providerId) return
        if (!getProviderDefinition(providerId)) {
            throw new BadRequestError(`Unknown market data provider: ${providerId}`)
        }
    }
}
