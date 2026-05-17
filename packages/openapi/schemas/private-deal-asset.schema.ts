import { z } from '../zod'
import { SuccessResponseSchema } from './response.schema'

/**
 * Private deal asset schema representing illiquid private market positions
 */
export const PrivateDealAssetSchema = z
    .object({
        id: z.uuid(),
        assetId: z.uuid(),
        committedAmount: z.number().nullable(),
        calledAmount: z.number().nullable(),
        latestNav: z.number().nullable(),
        navDate: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable()
    })
    .openapi('PrivateDealAsset')

/**
 * Private deal asset data schema representing the metadata fields that can be updated independently from the asset record
 */
export const PrivateDealAssetDataSchema = PrivateDealAssetSchema.omit({
    id: true,
    assetId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('PrivateDealAssetData')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for private deal asset details
 */
export const CreatePrivateDealAssetRequestSchema = z
    .object({
        committedAmount: z.number().positive(),
        calledAmount: z.number().min(0),
        latestNav: z.number().min(0),
        navDate: z.string()
    })
    .openapi('CreatePrivateDealAssetRequest')

/**
 * Response schema for creating a new private deal asset
 */
export const CreatePrivateDealAssetResponseSchema = SuccessResponseSchema(PrivateDealAssetDataSchema).openapi(
    'CreatePrivateDealAssetResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating private deal asset details
 */
export const UpdatePrivateDealAssetRequestSchema = z
    .object({
        committedAmount: z.number().positive(),
        calledAmount: z.number().min(0),
        latestNav: z.number().min(0),
        navDate: z.string()
    })
    .partial()
    .openapi('UpdatePrivateDealAssetRequest')

/**
 * Response schema for updating private deal asset details
 */
export const UpdatePrivateDealAssetResponseSchema = SuccessResponseSchema(PrivateDealAssetDataSchema).openapi(
    'UpdatePrivateDealAssetResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Form schema for private deal asset
 */
export const PrivateDealAssetFormSchema = CreatePrivateDealAssetRequestSchema.openapi('PrivateDealAssetForm')
