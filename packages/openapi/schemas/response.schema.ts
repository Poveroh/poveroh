import { z } from '../zod'

/**
 * Generic success response wrapper
 */
export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema?: T) =>
    z.object({
        success: z.literal(true).describe('Always true for success responses'),
        message: z.string().optional().describe('Optional success message'),
        data: (dataSchema || z.unknown()).optional().describe('Response data')
    })

/**
 * Created resource response (201)
 */
export const CreatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        success: z.literal(true).describe('Always true for success responses'),
        message: z.string().describe('Success message'),
        data: dataSchema.describe('Created resource data')
    })

/**
 * Simple success response without data
 */
export const SimpleSuccessResponseSchema = z
    .object({
        success: z.literal(true).describe('Always true for success responses'),
        message: z.string().optional().describe('Optional success message')
    })
    .openapi('SimpleSuccessResponse')
