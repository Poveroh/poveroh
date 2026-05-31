import { z } from '../zod'
import { SimpleSuccessResponseSchema } from './response.schema'

/**
 * Path params schema for provider credential operations
 */
export const UpdateMarketDataProviderPathParamsSchema = z
    .object({
        providerId: z.uuid()
    })
    .openapi('UpdateMarketDataProviderPathParams')

/**
 * Request schema for securely saving a per-user provider credential.
 */
export const UpdateMarketDataProviderCredentialRequestSchema = z
    .object({
        apiKey: z.string().trim().min(1)
    })
    .openapi('UpdateMarketDataProviderCredentialRequest')

/**
 * Response schema for provider credential updates
 */
export const UpdateMarketDataProviderCredentialResponseSchema = SimpleSuccessResponseSchema.openapi(
    'UpdateMarketDataProviderCredentialResponse'
)

/**
 * Response schema for provider credential deletion
 */
export const DeleteMarketDataProviderCredentialResponseSchema = SimpleSuccessResponseSchema.openapi(
    'DeleteMarketDataProviderCredentialResponse'
)
