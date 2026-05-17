import { z } from '../zod'
import { RealEstateTypeEnum } from './enum.schema'
import { SuccessResponseSchema } from './response.schema'

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
        purchaseDate: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable()
    })
    .openapi('RealEstateAsset')

/**
 * Real estate asset data schema representing the metadata fields that can be updated independently from the asset record
 */
export const RealEstateAssetDataSchema = RealEstateAssetSchema.omit({
    id: true,
    assetId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('RealEstateAssetData')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for real estate asset details
 */
export const CreateRealEstateAssetRequestSchema = z
    .object({
        address: z.string().trim().min(1),
        type: RealEstateTypeEnum,
        purchasePrice: z.number().positive(),
        purchaseDate: z.string()
    })
    .openapi('CreateRealEstateAssetRequest')

/**
 * Response schema for creating a new real estate asset
 */
export const CreateRealEstateAssetResponseSchema = SuccessResponseSchema(RealEstateAssetDataSchema).openapi(
    'CreateRealEstateAssetResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating real estate asset details
 */
export const UpdateRealEstateAssetRequestSchema = z
    .object({
        address: z.string().trim().min(1),
        type: RealEstateTypeEnum,
        purchasePrice: z.number().positive(),
        purchaseDate: z.string()
    })
    .partial()
    .openapi('UpdateRealEstateAssetRequest')

/**
 * Response schema for updating real estate asset details
 */
export const UpdateRealEstateAssetResponseSchema = SuccessResponseSchema(RealEstateAssetDataSchema).openapi(
    'UpdateRealEstateAssetResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Form schema for real estate asset
 */
export const RealEstateAssetFormSchema = CreateRealEstateAssetRequestSchema.openapi('RealEstateAssetForm')
