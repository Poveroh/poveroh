import { z } from '../zod'

/**
 * Private deal asset schema representing illiquid private market positions
 */
export const PrivateDealAssetSchema = z
    .object({
        id: z.uuid(),
        assetId: z.uuid(),
        committedAmount: z.number(),
        calledAmount: z.number(),
        latestNav: z.number(),
        navDate: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable()
    })
    .openapi('PrivateDealAsset')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for private deal asset details
 */
export const CreatePrivateDealAssetSchema = z
    .object({
        committedAmount: z.number(),
        calledAmount: z.number(),
        latestNav: z.number(),
        navDate: z.string()
    })
    .openapi('CreatePrivateDealAsset')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating private deal asset details
 */
export const PrivateDealAssetFormSchema = CreatePrivateDealAssetSchema.openapi('PrivateDealAssetForm')
