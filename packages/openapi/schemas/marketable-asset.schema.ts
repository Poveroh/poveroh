import { z } from '../zod'
import { AssetMarketDataTypeEnum, CurrencyEnum, MarketableAssetClassEnum } from './enum.schema'

/**
 * Marketable asset schema representing equity-like or quoted instruments
 */
export const MarketableAssetSchema = z
    .object({
        id: z.uuid(),
        assetId: z.uuid(),
        symbol: z.string(),
        isin: z.string().nullable(),
        exchange: z.string().nullable(),
        assetClass: MarketableAssetClassEnum.nullable(),
        sector: z.string().nullable(),
        region: z.string().nullable(),
        lastPriceSync: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable()
    })
    .openapi('MarketableAsset')

/**
 * Marketable asset metadata schema representing the metadata fields of a marketable asset that can be updated independently from the transaction history
 * This is used for the updateMarketableAsset endpoint, which allows updating the metadata fields without affecting the transaction history or current price data
 */
export const MarketableAssetDataSchema = MarketableAssetSchema.omit({
    id: true,
    assetId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('MarketableAssetData')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Form schema for marketable asset opening transaction details
 */
export const MarketableAssetFormSchema = z
    .object({
        transactionType: AssetMarketDataTypeEnum,
        assetClass: MarketableAssetClassEnum.nullable().optional(),
        symbol: z.string().trim().min(1),
        date: z.string(),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
        fees: z.number().min(0),
        currency: CurrencyEnum
    })
    .openapi('MarketableAssetForm')

/**
 * Request schema for creating a marketable asset and its opening transaction
 */
export const CreateMarketableAssetRequestSchema = MarketableAssetFormSchema.openapi('CreateMarketableAssetRequest')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating marketable asset common fields and metadata
 */
export const UpdateMarketableAssetRequestSchema =
    MarketableAssetFormSchema.partial().openapi('UpdateMarketableAssetRequest')
