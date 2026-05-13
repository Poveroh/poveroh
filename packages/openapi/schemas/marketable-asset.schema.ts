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
        isin: z.string(),
        exchange: z.string(),
        assetClass: MarketableAssetClassEnum,
        sector: z.string(),
        region: z.string(),
        lastPriceSync: z.string(),
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
 * Request schema for marketable asset details
 */
export const CreateMarketableAssetSchema = z
    .object({
        transactionType: AssetMarketDataTypeEnum,
        symbol: z.string().trim().min(1),
        date: z.string(),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
        fees: z.number().min(0),
        currency: CurrencyEnum
    })
    .openapi('CreateMarketableAsset')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating marketable asset details
 */
export const MarketableAssetFormSchema = CreateMarketableAssetSchema.openapi('MarketableAssetForm')
