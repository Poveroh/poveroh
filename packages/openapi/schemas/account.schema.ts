import { z } from '../zod'

export const AccountSchema = z
    .object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        type: z.string(), // enum se serve
        logoIcon: z.string(),
        balance: z.number(),
        userId: z.string(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })
    .openapi('Account')
