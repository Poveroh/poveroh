import { z } from '../zod'

/**
 * Collectible asset schema representing valuables and collectibles
 */
export const CollectibleAssetSchema = z
    .object({
        id: z.string().uuid(),
        assetId: z.string().uuid(),
        acquisitionCost: z.number().nullable(),
        acquisitionDate: z.string().datetime().nullable(),
        appraisalValue: z.number().nullable(),
        appraisalDate: z.string().datetime().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().nullable()
    })
    .openapi('CollectibleAsset')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for collectible asset details
 */
export const CreateCollectibleAssetSchema = z
    .object({
        acquisitionCost: z.number().nullable(),
        acquisitionDate: z.string().nullable(),
        appraisalValue: z.number().nullable(),
        appraisalDate: z.string().nullable()
    })
    .openapi('CreateCollectibleAssetDetails')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating collectible asset details
 */
export const CollectibleAssetFormSchema = CreateCollectibleAssetSchema.openapi('CollectibleAssetForm')
