import { z } from '../zod'
import { AssetTransactionSchema } from './asset-transaction.schema'
import { CollectibleAssetSchema, CreateCollectibleAssetSchema } from './collectible-asset.schema'
import { AssetTypeEnum, CurrencyEnum } from './enum.schema'
import { DateFilterSchema, ReadQuerySchema, StringFilterSchema } from './filter.schema'
import { CreateInsuranceAssetSchema, InsuranceAssetSchema } from './insurance-asset.schema'
import { CreateMarketableAssetSchema, MarketableAssetSchema } from './marketable-asset.schema'
import { CreatePrivateDealAssetSchema, PrivateDealAssetSchema } from './private-deal-asset.schema'
import { CreateRealEstateAssetSchema, RealEstateAssetSchema } from './real-estate-asset.schema'
import { SuccessResponseSchema } from './response.schema'
import { CreateVehicleAssetSchema, VehicleAssetSchema } from './vehicle-asset.schema'

/**
 * Asset schema representing a user's investment or non-cash asset
 */
export const AssetSchema = z
    .object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        title: z.string().nonempty(),
        type: AssetTypeEnum,
        currency: CurrencyEnum,
        currentValue: z.number().nullable(),
        currentValueAsOf: z.string().datetime().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().nullable(),
        marketable: MarketableAssetSchema.optional(),
        realEstate: RealEstateAssetSchema.optional(),
        collectible: CollectibleAssetSchema.optional(),
        privateDeal: PrivateDealAssetSchema.optional(),
        vehicle: VehicleAssetSchema.optional(),
        insurance: InsuranceAssetSchema.optional(),
        transactions: AssetTransactionSchema.array()
    })
    .openapi('Asset')

/**
 * Response schema for getting asset data (excluding userId and deletedAt)
 * This is the real Dto used for responses, while AssetSchema is the completed one
 * similar to Schema in DB
 */
export const AssetDataSchema = AssetSchema.omit({
    userId: true,
    deletedAt: true
}).openapi('AssetData')

/**
 * Asset by type summary schema representing portfolio aggregation grouped by asset type
 */
export const AssetByTypeSummarySchema = z
    .object({
        type: AssetTypeEnum,
        count: z.number().int().nonnegative(),
        totalCurrentValue: z.number()
    })
    .openapi('AssetByTypeSummary')

/**
 * Portfolio summary schema representing high-level aggregated investment metrics
 */
export const PortfolioSummarySchema = z
    .object({
        totalAssets: z.number().int().nonnegative(),
        totalCurrentValue: z.number(),
        totalWithLiveMarketData: z.number(),
        byType: z.array(AssetByTypeSummarySchema)
    })
    .openapi('PortfolioSummary')

/**
 * Response schema for getting a list of assets
 */
export const GetAssetListResponseSchema = SuccessResponseSchema(AssetDataSchema.array()).openapi('GetAssetListResponse')

/**
 * Response schema for getting a single asset by ID
 */
export const GetAssetResponseSchema = SuccessResponseSchema(AssetDataSchema).openapi('GetAssetResponse')

/**
 * Response schema for getting the aggregated portfolio summary
 */
export const GetPortfolioSummaryResponseSchema =
    SuccessResponseSchema(PortfolioSummarySchema).openapi('GetPortfolioSummaryResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Asset form schema representing the data structure for asset creation and editing forms
 */
const AssetFormSchema = AssetSchema.pick({
    title: true,
    currency: true,
    currentValue: true,
    currentValueAsOf: true,
    type: true
})
    .extend({
        marketable: CreateMarketableAssetSchema.optional(),
        realEstate: CreateRealEstateAssetSchema.optional(),
        collectible: CreateCollectibleAssetSchema.optional(),
        privateDeal: CreatePrivateDealAssetSchema.optional(),
        vehicle: CreateVehicleAssetSchema.optional(),
        insurance: CreateInsuranceAssetSchema.optional()
    })
    .openapi('AssetForm')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for creating a new asset
 */
export const CreateAssetRequestSchema = AssetFormSchema.openapi('CreateAssetRequest')

/**
 * Response schema for creating a new asset
 */
export const CreateAssetResponseSchema = SuccessResponseSchema(AssetDataSchema).openapi('CreateAssetResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating an existing asset
 */
export const UpdateAssetRequestSchema = AssetFormSchema.partial().openapi('UpdateAssetRequest')

/**
 * Response schema for updating an existing asset
 */
export const UpdateAssetResponseSchema = SuccessResponseSchema().openapi('UpdateAssetResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Response schema for deleting an asset
 */
export const DeleteAssetResponseSchema = SuccessResponseSchema().openapi('DeleteAssetResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Id parameter schema for referencing specific assets in path parameters
 */
export const AssetParamsIdSchema = AssetSchema.pick({
    id: true
}).openapi('AssetParamsId')

/**
 * Asset filters schema representing the structure of filters that can be applied when querying assets
 */
export const AssetFiltersSchema = z
    .object({
        id: AssetParamsIdSchema.optional(),
        title: StringFilterSchema.optional(),
        type: AssetTypeEnum.optional(),
        symbol: StringFilterSchema.optional(),
        currency: CurrencyEnum.optional(),
        currentValueAsOf: DateFilterSchema.optional()
    })
    .openapi('AssetFilters')

/**
 * Query schema for asset filters
 */
export const QueryAssetFiltersSchema = ReadQuerySchema(AssetFiltersSchema).openapi('QueryAssetFilters')

/**
 * Union schema for asset creation and updating requests, allowing the same form to be used for both operations with appropriate validation
 */
export const CreateUpdateAssetRequestSchema = z
    .union([CreateAssetRequestSchema, UpdateAssetRequestSchema])
    .openapi('CreateUpdateAssetRequest')
