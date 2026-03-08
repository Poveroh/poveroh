import { z } from '../zod'
import { DateFilterSchema } from './filter.schema'

/**
 * Net worth evolution schema representing the net worth of a user at a specific date
 * It includes fields for the date and the corresponding net worth value
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
 * Net worth evolution filters schema representing the structure of filters that can be applied when querying net worth evolution data
 * It includes an optional date filter to allow for flexible querying based on specific date ranges or criteria
 */
export const NetWorthEvolutionFiltersSchema = z
    .object({
        date: DateFilterSchema.optional()
    })
    .partial()
    .catchall(z.union([z.string(), DateFilterSchema]))
    .openapi('NetWorthEvolutionFilters')
