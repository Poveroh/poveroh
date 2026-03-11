import { z } from '../zod'
import { SuccessResponseSchema } from './response.schema'

/**
 * Dashboard layout item schema representing an individual item in the dashboard layout
 */
export const DashboardLayoutItemSchema = z
    .object({
        id: z.string().uuid(),
        colSpan: z.number(),
        minHeight: z.number(),
        visible: z.boolean().default(true)
    })
    .openapi('DashboardLayoutItem')

/**
 * Dashboard layout schema representing the structure of a user's dashboard layout
 */
export const DashboardLayoutSchema = z
    .object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        version: z.number(),
        layout: z.array(DashboardLayoutItemSchema),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })
    .openapi('DashboardLayout')

/**
 * Response schema for getting a dashboard layout, containing only the layout and version fields
 */
export const GetDashboardLayoutSchema = DashboardLayoutSchema.pick({
    layout: true,
    version: true
}).openapi('GetDashboardLayout')

/**
 * Response schema for getting a dashboard layout
 */
export const GetDashboardLayoutResponseSchema =
    SuccessResponseSchema(GetDashboardLayoutSchema).openapi('GetDashboardLayoutResponse')

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
export const UpdateDashboardLayoutResponseSchema = SuccessResponseSchema().openapi('UpdateDashboardLayoutResponse')
