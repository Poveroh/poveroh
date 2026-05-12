import { z } from '../zod'
import { AssetMarketDataTypeEnum, CurrencyEnum, MarketableAssetClassEnum } from './enum.schema'

/**
 * Marketable asset schema representing equity-like or quoted instruments
 */
export const MarketableAssetSchema = z
    .object({
        id: z.string().uuid(),
        assetId: z.string().uuid(),
        symbol: z.string().nullable(),
        isin: z.string().nullable(),
        exchange: z.string().nullable(),
        assetClass: MarketableAssetClassEnum.nullable(),
        sector: z.string().nullable(),
        region: z.string().nullable(),
        lastPriceSync: z.string().datetime().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().nullable()
    })
    .openapi('MarketableAsset')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for marketable asset details
 */
export const CreateMarketableAssetSchema = z
    .object({
        transactionType: AssetMarketDataTypeEnum,
        symbol: z.string().trim().min(1),
        date: z.string().min(1),
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
