import { z } from '../zod'

/**
 * Status response schema representing the structure of the response returned by the status endpoint
 * It includes fields for the status of the application, uptime, version, and timestamp of the response
 */
export const StatusResponseSchema = z
    .object({
        status: z.string(),
        uptime: z.number(),
        version: z.string(),
        timestamp: z.string().datetime()
    })
    .openapi('StatusResponse')
