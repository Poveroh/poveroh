import { z } from '../zod'
import { AssetTransactionDataSchema } from './asset-transaction.schema'
import { CollectibleAssetSchema } from './collectible-asset.schema'
import { AssetTypeEnum, CurrencyEnum } from './enum.schema'
import { DateFilterSchema, ReadQuerySchema, StringFilterSchema } from './filter.schema'
import { InsuranceAssetSchema } from './insurance-asset.schema'
import { MarketableAssetSchema } from './marketable-asset.schema'
import { PrivateDealAssetSchema } from './private-deal-asset.schema'
import { RealEstateAssetSchema } from './real-estate-asset.schema'
import { VehicleAssetSchema } from './vehicle-asset.schema'
import { SuccessResponseSchema } from './response.schema'

/**
 * Asset schema representing a user's investment or non-cash asset
 */
export const AssetSchema = z
    .object({
        id: z.uuid(),
        userId: z.uuid(),
        title: z.string().nonempty(),
        type: AssetTypeEnum,
        currency: CurrencyEnum,
        currentValue: z.number(),
        currentValueAsOf: z.string(),
        quantity: z.number().min(0),
        totalInvested: z.number().min(0),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable(),
        marketable: MarketableAssetSchema.optional(),
        realEstate: RealEstateAssetSchema.optional(),
        collectible: CollectibleAssetSchema.optional(),
        privateDeal: PrivateDealAssetSchema.optional(),
        vehicle: VehicleAssetSchema.optional(),
        insurance: InsuranceAssetSchema.optional(),
        transactions: AssetTransactionDataSchema.array()
    })
    .openapi('Asset')

/**
 * Response schema for getting asset data with transaction-derived position metrics
 */
export const AssetDataSchema = AssetSchema.omit({
    userId: true,
    deletedAt: true
}).openapi('AssetData')

/**
 * Response schema for getting a list of assets
 */
export const GetAssetListResponseSchema = SuccessResponseSchema(AssetDataSchema.array()).openapi('GetAssetListResponse')

/**
 * Response schema for getting a single asset by ID
 */
export const GetAssetResponseSchema = SuccessResponseSchema(AssetDataSchema).openapi('GetAssetResponse')

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
