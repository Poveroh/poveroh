import { z } from '../zod'

export const SessionSchema = z
    .object({
        id: z.string(),
        userId: z.string(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })
    .openapi('Session')
