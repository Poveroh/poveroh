import { z } from '../zod'

/**
 * StringFilterSchema defines a schema for filtering string fields in API requests.
 * It includes optional properties for exact matches (equals) and partial matches (contains).
 * This schema can be used to create flexible filtering options for string fields in various API endpoints.
 */
export const StringFilterSchema = z
    .object({
        equals: z.string().optional(),
        contains: z.string().optional()
    })
    .openapi('StringFilter')

/**
 * FilterOptionsSchema defines a schema for pagination and sorting options in API requests.
 * It includes optional properties for skipping a certain number of records (skip), limiting the number of records returned (take),
 * specifying the field to sort by (sortBy), and the sort order (sortOrder).
 * This schema can be used to create flexible querying options for various API endpoints that support pagination and sorting.
 */
export const FilterOptionsSchema = z
    .object({
        skip: z.number().int().nonnegative().optional(),
        take: z.number().int().positive().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional()
    })
    .openapi('FilterOptions')

/**
 * DateFilterSchema defines a schema for filtering date fields in API requests.
 * It includes optional properties for filtering records that are greater than or equal to a certain date (gte) and less than or equal to a certain date (lte).
 * Exact dates can be specified using the gte and lte properties, allowing for flexible date range filtering in various API endpoints.
 * This schema can be used to create flexible filtering options for date fields in various API endpoints.
 */
export const DateFilterSchema = z
    .object({
        gte: z.string().datetime().optional(),
        lte: z.string().datetime().optional()
    })
    .openapi('DateFilter')

/**
 * ReadQuerySchema defines a schema for read queries in API requests.
 * @param dataSchema The schema for the filter data
 * @returns A schema for the read query, including filter and options
 */
export const ReadQuerySchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        filter: dataSchema.optional(),
        options: FilterOptionsSchema.optional()
    })
