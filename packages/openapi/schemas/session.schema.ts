import { z } from '../zod'

export const SessionSchema = z
    .object({
        id: z.string(),
        userId: z.string(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })
    .openapi('Session')

export const SessionRequestSchema = z
    .object({
        token: z.string().optional(),
        expiresAt: z.string().datetime().optional()
    })
    .openapi('SessionRequest')

export const SessionResponseSchema = z
    .object({
        data: SessionSchema
    })
    .openapi('SessionResponse')
