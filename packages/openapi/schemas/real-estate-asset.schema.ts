import { z } from '../zod'
import { RealEstateTypeEnum } from './enum.schema'

/**
 * Real estate asset schema representing property-specific details
 */
export const RealEstateAssetSchema = z
    .object({
        id: z.string().uuid(),
        assetId: z.string().uuid(),
        address: z.string().nullable(),
        type: RealEstateTypeEnum,
        purchasePrice: z.number().nullable(),
        purchaseDate: z.string().datetime().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().nullable()
    })
    .openapi('RealEstateAsset')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for real estate asset details
 */
export const CreateRealEstateAssetSchema = z
    .object({
        assetName: z.string().trim().min(1),
        propertyType: RealEstateTypeEnum,
        purchasePrice: z.number().positive(),
        purchaseDate: z.string().nullable(),
        address: z.string().trim().min(1)
    })
    .openapi('CreateRealEstateAsset')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating real estate asset details
 */
export const RealEstateAssetFormSchema = CreateRealEstateAssetSchema.openapi('RealEstateAssetForm')
