import { z } from '../zod'

export const StatusResponseSchema = z
    .object({
        status: z.string(),
        uptime: z.number(),
        version: z.string(),
        timestamp: z.string().datetime()
    })
    .openapi('StatusResponse')
