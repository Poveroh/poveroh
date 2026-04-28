import { z } from '../zod'
import { AssetTypeEnum, CurrencyEnum, MarketDataTransportEnum, MarketStateEnum, ValueSourceEnum } from './enum.schema'
import { SimpleSuccessResponseSchema, SuccessResponseSchema } from './response.schema'

/**
 * Market data provider schema representing an available raw data provider
 */
export const MarketDataProviderSchema = z
    .object({
        id: z.string().nonempty(),
        label: z.string().nonempty(),
        transport: MarketDataTransportEnum,
        enabled: z.boolean(),
        configured: z.boolean(),
        requiresCredentials: z.boolean(),
        supportsSearch: z.boolean(),
        supportsQuotes: z.boolean(),
        supportsStreaming: z.boolean(),
        supportedAssetTypes: z.array(AssetTypeEnum)
    })
    .openapi('MarketDataProvider')

/**
 * Market instrument schema representing a normalized provider search result
 */
export const MarketInstrumentSchema = z
    .object({
        providerId: z.string().nonempty(),
        providerInstrumentId: z.string().nonempty(),
        symbol: z.string().nonempty(),
        displayName: z.string().nonempty(),
        assetType: AssetTypeEnum,
        currency: CurrencyEnum,
        exchange: z.string().nullable(),
        market: z.string().nullable(),
        metadata: z.record(z.string(), z.string()).default({})
    })
    .openapi('MarketInstrument')

/**
 * Market quote schema representing a normalized live quote
 */
export const MarketQuoteSchema = z
    .object({
        providerId: z.string().nonempty(),
        symbol: z.string().nonempty(),
        assetType: AssetTypeEnum,
        currency: CurrencyEnum,
        price: z.number(),
        changePercent: z.number().nullable(),
        marketState: MarketStateEnum,
        asOf: z.string().datetime(),
        valueSource: ValueSourceEnum,
        displayName: z.string().nullable(),
        exchange: z.string().nullable(),
        market: z.string().nullable()
    })
    .openapi('MarketQuote')

/**
 * Response schema for getting the list of enabled market data providers
 */
export const GetMarketDataProvidersResponseSchema = SuccessResponseSchema(MarketDataProviderSchema.array()).openapi(
    'GetMarketDataProvidersResponse'
)

/**
 * Response schema for searching market instruments across providers
 */
export const SearchMarketInstrumentsResponseSchema = SuccessResponseSchema(MarketInstrumentSchema.array()).openapi(
    'SearchMarketInstrumentsResponse'
)

/**
 * Response schema for getting normalized market quotes
 */
export const GetMarketQuotesResponseSchema = SuccessResponseSchema(MarketQuoteSchema.array()).openapi(
    'GetMarketQuotesResponse'
)

/**
 * Path params schema for provider credential operations
 */
export const SaveMarketDataProviderPathParamsSchema = z
    .object({
        providerId: z.string().nonempty()
    })
    .openapi('SaveMarketDataProviderPathParams')

/**
 * Request schema for securely saving a per-user provider credential
 */
export const SaveMarketDataProviderCredentialRequestSchema = z
    .object({
        apiKey: z.string().trim().min(1)
    })
    .openapi('SaveMarketDataProviderCredentialRequest')

/**
 * Response schema for provider credential updates
 */
export const SaveMarketDataProviderCredentialResponseSchema = SimpleSuccessResponseSchema.openapi(
    'SaveMarketDataProviderCredentialResponse'
)

/**
 * Response schema for provider credential deletion
 */
export const DeleteMarketDataProviderCredentialResponseSchema = SimpleSuccessResponseSchema.openapi(
    'DeleteMarketDataProviderCredentialResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Base query schema for choosing a provider and filtering by asset type
 */
export const MarketDataProviderQuerySchema = z
    .object({
        providerId: z.string().optional(),
        assetType: AssetTypeEnum.optional()
    })
    .openapi('MarketDataProviderQuery')

/**
 * Query schema for searching market instruments
 */
export const SearchMarketInstrumentsQuerySchema = MarketDataProviderQuerySchema.extend({
    q: z.string().nonempty(),
    limit: z.coerce.number().int().positive().max(50).optional()
}).openapi('SearchMarketInstrumentsQuery')

/**
 * Query schema for requesting one or more market quotes
 */
export const GetMarketQuotesQuerySchema = MarketDataProviderQuerySchema.extend({
    symbols: z.union([z.string().nonempty(), z.array(z.string().nonempty()).nonempty()])
}).openapi('GetMarketQuotesQuery')
