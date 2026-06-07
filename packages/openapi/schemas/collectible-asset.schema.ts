import { z } from '../zod'

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
 * Request schema for creating a collectible asset together with its parent asset record.
 * `value` feeds both the parent asset current value and the collectible acquisition cost,
 * while the appraisal fields are optional details shown without a mandatory marker.
 */
export const CreateCollectibleAssetRequestSchema = z
    .object({
        title: z.string().trim().min(1),
        value: z.number().positive(),
        acquisitionDate: z.string().optional(),
        appraisalValue: z.number().positive().optional(),
        appraisalDate: z.string().optional()
    })
    .openapi('CreateCollectibleAssetRequest')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating collectible asset details
 */
export const UpdateCollectibleAssetRequestSchema = CreateCollectibleAssetRequestSchema.partial().openapi(
    'UpdateCollectibleAssetRequest'
)

/**
 * Form schema for the collectible asset dialog, aliasing the create request shape
 */
export const CollectibleAssetFormSchema = CreateCollectibleAssetRequestSchema.openapi('CollectibleAssetForm')
