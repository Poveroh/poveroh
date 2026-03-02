import { z } from '../zod'

/**
 * Error response schema representing the structure of error responses returned by the API
 * It includes a success field that is always false, a message field describing the error, and an optional error field for additional details or context about the error
 */
export const ErrorResponseSchema = z
    .object({
        success: z.literal(false).describe('Always false for error responses'),
        message: z.string().describe('Error message describing what went wrong'),
        error: z.unknown().optional().describe('Optional additional error details or context')
    })
    .openapi('ErrorResponse')
