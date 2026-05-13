import { z } from '../zod'
import { RealEstateTypeEnum } from './enum.schema'

/**
 * Real estate asset schema representing property-specific details
 */
export const RealEstateAssetSchema = z
    .object({
        id: z.uuid(),
        assetId: z.uuid(),
        address: z.string(),
        type: RealEstateTypeEnum,
        purchasePrice: z.number(),
        purchaseDate: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable()
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
        purchaseDate: z.string(),
        address: z.string().trim().min(1)
    })
    .openapi('CreateRealEstateAsset')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating real estate asset details
 */
export const RealEstateAssetFormSchema = CreateRealEstateAssetSchema.openapi('RealEstateAssetForm')
