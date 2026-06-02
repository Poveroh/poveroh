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
 * Form schema for creating a real estate asset together with its parent asset record.
 * `value` feeds both the parent asset current value and the property purchase price,
 * while `address` and `purchaseDate` are optional details shown without a mandatory marker.
 */
export const RealEstateAssetFormSchema = z
    .object({
        title: z.string().trim().min(1),
        type: RealEstateTypeEnum,
        value: z.number().positive(),
        purchaseDate: z.string().optional(),
        address: z.string().trim().optional()
    })
    .openapi('RealEstateAssetForm')

/**
 * Request schema for creating a real estate asset and its parent asset record
 */
export const CreateRealEstateAssetRequestSchema = RealEstateAssetFormSchema.openapi('CreateRealEstateAssetRequest')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating real estate asset details
 */
export const UpdateRealEstateAssetRequestSchema =
    RealEstateAssetFormSchema.partial().openapi('UpdateRealEstateAssetRequest')
