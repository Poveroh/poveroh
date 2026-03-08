import { z } from '../zod'
import { SuccessResponseSchema } from './response.schema'

/**
 * Dashboard layout schema representing the structure of a user's dashboard layout
 */
export const DashboardLayoutSchema = z
    .object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        version: z.number(),
        layout: z.string(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })
    .openapi('DashboardLayout')

/**
 * Response schema for getting a dashboard layout
 */
export const GetDashboardLayoutResponseSchema =
    SuccessResponseSchema(DashboardLayoutSchema).openapi('GetDashboardLayoutResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating a dashboard layout
 */
export const UpdateDashboardLayoutRequestSchema = DashboardLayoutSchema.omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true
}).openapi('UpdateDashboardLayoutRequest')

/**
 * Response schema for updating a dashboard layout
 */
export const UpdateDashboardLayoutResponseSchema = SuccessResponseSchema(DashboardLayoutSchema).openapi(
    'UpdateDashboardLayoutResponse'
)
