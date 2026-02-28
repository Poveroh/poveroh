import { z } from '../zod'

export const ReportRequestSchema = z
    .object({
        from: z.string().datetime(),
        to: z.string().datetime(),
        type: z.string().optional()
    })
    .openapi('ReportRequest')

export const ReportResponseSchema = z
    .object({
        reportType: z.string(),
        totals: z.record(z.number()),
        metadata: z.any().optional()
    })
    .openapi('ReportResponse')
