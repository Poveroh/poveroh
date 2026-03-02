import { z } from '../zod'

export const StringFilterSchema = z
    .object({
        equals: z.string().optional(),
        contains: z.string().optional()
    })
    .openapi('StringFilter')

export const FilterOptionsSchema = z
    .object({
        skip: z.number().int().nonnegative().optional(),
        take: z.number().int().positive().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional()
    })
    .openapi('FilterOptions')

export const ReadQuerySchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        filter: dataSchema.optional(),
        options: FilterOptionsSchema.optional()
    })
