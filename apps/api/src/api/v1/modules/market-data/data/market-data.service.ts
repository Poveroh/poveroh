import type {
    AssetTypeEnum,
    GetHistoricalQuotesParams,
    GetMarketQuotesQuery,
    HistoricalQuote,
    MarketDataProvider,
    MarketInstrument,
    MarketQuote,
    SearchMarketInstrumentsQuery
} from '@poveroh/types'
import { DEFAULT_MARKET_DATA_PROVIDER, MarketDataError } from '@poveroh/types'
import { createMarketDataClient } from '@poveroh/market-data'

import { BadRequestError, InternalServerError } from '@/utils'
import { BaseService } from '@/v1/modules/base/base.service'
import { MARKET_DATA_PROVIDER_REGISTRY, getProviderDefinition } from '@/v1/content/template/market-data-providers'
import { MarketDataRepository } from './market-data.repository'
import { MarketDataCredentialService } from '../credentials/market-data-credential.service'
import { UserPreferencesService } from '@/v1/modules/users/preferences/user-preferences.service'

/**
 * Service that exposes provider metadata and (future) market data fetching.
 * Provider listing is user-scoped because the `configured` flag depends on which
 * credentials the current user has stored.
 */
export class MarketDataService extends BaseService {
    private readonly marketDataRepository = new MarketDataRepository()
    private readonly credentialService = new MarketDataCredentialService()
    private readonly preferencesService = new UserPreferencesService()

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
     * Searches provider instruments through the resolved provider's adapter.
     * @param params Search parameters including provider, asset type, and query.
     * @returns A promise that resolves to the normalized list of matching instruments.
     */
    async searchInstruments(params: SearchMarketInstrumentsQuery): Promise<MarketInstrument[]> {
        const providerId = await this.resolveProviderId(params.providerId)
        const client = await this.buildClient(providerId)

        const instruments = await this.runProviderCall(providerId, () =>
            client.searchInstruments({ query: params.q, assetType: params.assetType, limit: params.limit })
        )

        if (!params.assetType) return instruments

        return instruments.filter(instrument => instrument.assetType === params.assetType)
    }

    /**
     * Fetches normalized quotes through the resolved provider's adapter.
     * @param params Quote parameters including provider, asset type, and the requested symbols.
     * @returns A promise that resolves to the normalized list of quotes.
     */
    async getQuotes(params: GetMarketQuotesQuery): Promise<MarketQuote[]> {
        if (params.symbols.length === 0) {
            throw new BadRequestError('At least one symbol is required')
        }

        const providerId = await this.resolveProviderId(params.providerId)
        const client = await this.buildClient(providerId)

        return this.runProviderCall(providerId, () =>
            client.getQuotes({ symbols: params.symbols, assetType: params.assetType })
        )
    }

    /**
     * Fetches a daily historical close-price series through the resolved provider's adapter.
     * @param params The symbol, from/to date range, and optional provider override.
     * @returns A promise that resolves to the normalized list of historical daily quotes.
     */
    async getHistoricalQuotes(params: GetHistoricalQuotesParams & { providerId?: string }): Promise<HistoricalQuote[]> {
        const providerId = await this.resolveProviderId(params.providerId)
        const client = await this.buildClient(providerId)

        return this.runProviderCall(providerId, () =>
            client.getHistoricalQuotes({ symbol: params.symbol, from: params.from, to: params.to })
        )
    }

    /**
     * Resolves the provider to use for a request: an explicit id wins, then the
     * user's preferred provider, falling back to the no-credential default.
     * @param explicitProviderId An optional provider id supplied by the caller.
     * @returns A promise that resolves to a registered provider id.
     */
    private async resolveProviderId(explicitProviderId?: string): Promise<string> {
        if (explicitProviderId) {
            this.assertProviderRegistered(explicitProviderId)
            return explicitProviderId
        }

        const preferences = await this.preferencesService.getPreferences()
        const providerId = preferences.preferredMarketDataProviderId || DEFAULT_MARKET_DATA_PROVIDER.id
        this.assertProviderRegistered(providerId)

        return providerId
    }

    /**
     * Builds a provider adapter, loading and decrypting the stored API key for
     * providers that require credentials.
     * @param providerId The registered provider id to build a client for.
     * @returns A promise that resolves to a ready-to-use market data adapter.
     */
    private async buildClient(providerId: string) {
        const definition = getProviderDefinition(providerId)
        if (!definition) {
            throw new BadRequestError(`Unknown market data provider: ${providerId}`)
        }

        if (!definition.requiresCredentials) {
            return createMarketDataClient(providerId)
        }

        const apiKey = await this.credentialService.getDecryptedCredential(providerId)
        if (!apiKey) {
            throw new BadRequestError(`Provider "${providerId}" is not configured. Add an API key in settings.`)
        }

        return createMarketDataClient(providerId, { apiKey })
    }

    /**
     * Executes a provider adapter call, translating provider-side failures into
     * the appropriate HttpError so they surface cleanly to the client.
     * @param providerId The provider id used for error context.
     * @param call The adapter invocation to run.
     * @returns A promise that resolves to the adapter result.
     */
    private async runProviderCall<T>(providerId: string, call: () => Promise<T>): Promise<T> {
        try {
            return await call()
        } catch (error) {
            if (error instanceof MarketDataError) {
                // A 4xx from the provider is a client/config problem (bad or unentitled API key),
                // not a server fault, so surface it as a BadRequest with the upstream status.
                if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
                    throw new BadRequestError(
                        `Market data provider "${providerId}" rejected the request (HTTP ${error.statusCode}). Check that the API key is valid and that your plan includes this endpoint.`
                    )
                }
                throw new InternalServerError(`Market data request to "${providerId}" failed: ${error.message}`)
            }
            throw error
        }
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
