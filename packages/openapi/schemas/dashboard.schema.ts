import { z } from '../zod'

export const DashboardLayoutSchema = z
    .object({
        id: z.string(),
        userId: z.string(),
        version: z.number(),
        layout: z.any(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })
    .openapi('DashboardLayout')

export const DashboardLayoutRequestSchema = z
    .object({
        version: z.number().optional(),
        layout: z.any()
    })
    .openapi('DashboardLayoutRequest')

export const DashboardLayoutResponseSchema = z
    .object({
        data: DashboardLayoutSchema
    })
    .openapi('DashboardLayoutResponse')
