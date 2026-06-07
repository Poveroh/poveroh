import { z } from '../zod'

/**
 * Other asset schema representing miscellaneous assets that do not fit a dedicated category
 */
export const OtherAssetSchema = z
    .object({
        id: z.uuid(),
        assetId: z.uuid(),
        description: z.string().nullable(),
        purchasePrice: z.number().nullable(),
        purchaseDate: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable()
    })
    .openapi('OtherAsset')

/**
 * Other asset data schema representing the metadata fields that can be updated independently from the asset record
 */
export const OtherAssetDataSchema = OtherAssetSchema.omit({
    id: true,
    assetId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('OtherAssetData')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for creating an other asset together with its parent asset record.
 * `value` feeds both the parent asset current value and the purchase price,
 * while `description` and `purchaseDate` are optional details shown without a mandatory marker.
 */
export const CreateOtherAssetRequestSchema = z
    .object({
        title: z.string().trim().min(1),
        value: z.number().positive(),
        purchaseDate: z.string().optional(),
        description: z.string().trim().optional()
    })
    .openapi('CreateOtherAssetRequest')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating other asset details
 */
export const UpdateOtherAssetRequestSchema = CreateOtherAssetRequestSchema.partial().openapi('UpdateOtherAssetRequest')

/**
 * Form schema for the other asset dialog, aliasing the create request shape
 */
export const OtherAssetFormSchema = CreateOtherAssetRequestSchema.openapi('OtherAssetForm')
