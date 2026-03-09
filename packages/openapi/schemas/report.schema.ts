import { z } from '../zod'
import { DateFilterSchema, ReadQuerySchema } from './filter.schema'
import { SuccessResponseSchema } from './response.schema'

/**
 * Net worth evolution schema representing the net worth of a user at a specific date
 */
export const NetWorthEvolutionSchema = z
    .object({
        date: z.string().datetime(),
        netWorth: z.number()
    })
    .openapi('NetWorthEvolution')

export const NetWorthEvolutionReportSchema = z
    .object({
        currentNetWorth: z.number(),
        evolution: z.array(NetWorthEvolutionSchema)
    })
    .openapi('NetWorthEvolutionReport')

/**
 * Response schema for getting a net worth evolution report
 */
export const GetNetWorthEvolutionReportResponseSchema = SuccessResponseSchema(NetWorthEvolutionReportSchema).openapi(
    'GetNetWorthEvolutionReportResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Net worth evolution filters schema representing the structure of filters that can be applied when querying net worth evolution data
 */
export const NetWorthEvolutionFiltersSchema = z
    .object({
        date: DateFilterSchema.optional()
    })
    .partial()
    .catchall(z.union([z.string(), DateFilterSchema]))
    .openapi('NetWorthEvolutionFilters')

/**
 * Query schema for net worth evolution filters
 */
export const QueryNetWorthEvolutionFiltersSchema = ReadQuerySchema(NetWorthEvolutionFiltersSchema).openapi(
    'QueryNetWorthEvolutionFilters'
)
