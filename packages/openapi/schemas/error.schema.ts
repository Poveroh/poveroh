import { z } from '../zod'

export const ErrorResponseSchema = z
    .object({
        success: z.literal(false).describe('Always false for error responses'),
        message: z.string().describe('Error message describing what went wrong'),
        error: z.unknown().optional().describe('Optional additional error details or context')
    })
    .openapi('ErrorResponse')
