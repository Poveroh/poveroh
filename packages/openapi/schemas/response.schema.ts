import { z } from '../zod'

/**
 * Generic success response wrapper
 */
export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema?: T) =>
    z.object({
        success: z.boolean().describe('Indicates if the request was successful'),
        message: z.string().describe('Optional success message'),
        data: (dataSchema || z.unknown()).describe('Response data')
    })

/**
 * Simple success response without data
 */
export const SimpleSuccessResponseSchema = z
    .object({
        success: z.boolean().describe('Indicates if the request was successful'),
        message: z.string().describe('Optional success message')
    })
    .openapi('SimpleSuccessResponse')
