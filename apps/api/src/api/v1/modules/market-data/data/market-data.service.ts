import type { AssetTypeEnum, MarketDataProvider, MarketInstrument, MarketQuote } from '@poveroh/types'

import { BadRequestError } from '@/utils'
import { BaseService } from '@/v1/modules/base/base.service'
import { MARKET_DATA_PROVIDER_REGISTRY, getProviderDefinition } from '@/v1/content/template/market-data-providers'
import { MarketDataRepository } from './market-data.repository'

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

/**
 * Service that exposes provider metadata and (future) market data fetching.
 * Provider listing is user-scoped because the `configured` flag depends on which
 * credentials the current user has stored.
 */
export class MarketDataService extends BaseService {
    private readonly marketDataRepository = new MarketDataRepository()

    constructor() {
        super('market-data')
    }

    /**
     * Returns the static provider registry enriched with a per-user `configured` flag.
     * @returns A promise that resolves to the list of providers with per-user configuration metadata.
     */
    async getProviders(): Promise<MarketDataProvider[]> {
        const userId = this.context.currentUser.id
        const configuredIds = new Set(await this.marketDataRepository.listConfiguredProviderIds(userId))

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

    /**
     * Searches provider instruments. Currently a stub until provider clients are implemented.
     * @param params Search parameters including provider, asset type, and query.
     */
    async searchInstruments(params: SearchMarketInstrumentsParams): Promise<MarketInstrument[]> {
        this.assertProviderRegistered(params.providerId)
        throw new BadRequestError('Market data fetching is not implemented yet for the configured providers')
    }

    /**
     * Fetches normalized quotes. Currently a stub until provider clients are implemented.
     * @param params Quote parameters including provider, asset type, and the requested symbols.
     */
    async getQuotes(params: GetMarketQuotesParams): Promise<MarketQuote[]> {
        if (params.symbols.length === 0) {
            throw new BadRequestError('At least one symbol is required')
        }

        this.assertProviderRegistered(params.providerId)
        throw new BadRequestError('Market data fetching is not implemented yet for the configured providers')
    }

    /**
     * Validates that an explicitly requested providerId exists in the registry.
     * @param providerId The provider identifier to validate, if provided.
     */
    private assertProviderRegistered(providerId?: string): void {
        if (!providerId) return
        if (!getProviderDefinition(providerId)) {
            throw new BadRequestError(`Unknown market data provider: ${providerId}`)
        }
    }
}
