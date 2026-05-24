import { z } from '../zod'
import { SuccessResponseSchema } from './response.schema'

/**
 * Collectible asset schema representing valuables and collectibles
 */
export const CollectibleAssetSchema = z
    .object({
        id: z.uuid(),
        assetId: z.uuid(),
        acquisitionCost: z.number().nullable(),
        acquisitionDate: z.string().nullable(),
        appraisalValue: z.number().nullable(),
        appraisalDate: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable()
    })
    .openapi('CollectibleAsset')

/**
 * Collectible asset data schema representing the metadata fields that can be updated independently from the asset record
 */
export const CollectibleAssetDataSchema = CollectibleAssetSchema.omit({
    id: true,
    assetId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('CollectibleAssetData')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for collectible asset details
 */
export const CreateCollectibleAssetRequestSchema = z
    .object({
        acquisitionCost: z.number().positive(),
        acquisitionDate: z.string(),
        appraisalValue: z.number().positive(),
        appraisalDate: z.string()
    })
    .openapi('CreateCollectibleAssetRequest')

/**
 * Response schema for creating a new collectible asset
 */
export const CreateCollectibleAssetResponseSchema = SuccessResponseSchema(CollectibleAssetDataSchema).openapi(
    'CreateCollectibleAssetResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating collectible asset details
 */
export const UpdateCollectibleAssetRequestSchema = z
    .object({
        acquisitionCost: z.number().positive(),
        acquisitionDate: z.string(),
        appraisalValue: z.number().positive(),
        appraisalDate: z.string()
    })
    .partial()
    .openapi('UpdateCollectibleAssetRequest')

/**
 * Response schema for updating collectible asset details
 */
export const UpdateCollectibleAssetResponseSchema = SuccessResponseSchema(CollectibleAssetDataSchema).openapi(
    'UpdateCollectibleAssetResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Form schema for collectible asset
 */
export const CollectibleAssetFormSchema = CreateCollectibleAssetRequestSchema.openapi('CollectibleAssetForm')
