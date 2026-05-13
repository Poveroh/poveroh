import { z } from '../zod'

/**
 * Collectible asset schema representing valuables and collectibles
 */
export const CollectibleAssetSchema = z
    .object({
        id: z.uuid(),
        assetId: z.uuid(),
        acquisitionCost: z.number(),
        acquisitionDate: z.string(),
        appraisalValue: z.number(),
        appraisalDate: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string()
    })
    .openapi('CollectibleAsset')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for collectible asset details
 */
export const CreateCollectibleAssetSchema = z
    .object({
        acquisitionCost: z.number(),
        acquisitionDate: z.string(),
        appraisalValue: z.number(),
        appraisalDate: z.string()
    })
    .openapi('CreateCollectibleAssetDetails')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating collectible asset details
 */
export const CollectibleAssetFormSchema = CreateCollectibleAssetSchema.openapi('CollectibleAssetForm')
