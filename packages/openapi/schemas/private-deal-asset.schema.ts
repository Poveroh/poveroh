import { z } from '../zod'

/**
 * Private deal asset schema representing illiquid private market positions
 */
export const PrivateDealAssetSchema = z
    .object({
        id: z.string().uuid(),
        assetId: z.string().uuid(),
        committedAmount: z.number().nullable(),
        calledAmount: z.number().nullable(),
        latestNav: z.number().nullable(),
        navDate: z.string().datetime().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().nullable()
    })
    .openapi('PrivateDealAsset')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for private deal asset details
 */
export const CreatePrivateDealAssetSchema = z
    .object({
        committedAmount: z.number().nullable(),
        calledAmount: z.number().nullable(),
        latestNav: z.number().nullable(),
        navDate: z.string().nullable()
    })
    .openapi('CreatePrivateDealAsset')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating private deal asset details
 */
export const PrivateDealAssetFormSchema = CreatePrivateDealAssetSchema.openapi('PrivateDealAssetForm')
