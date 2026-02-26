import { z } from '../zod'

export const ErrorResponseSchema = z
    .object({
        message: z.string(),
        error: z.unknown().optional()
    })
    .openapi('ErrorResponse')
