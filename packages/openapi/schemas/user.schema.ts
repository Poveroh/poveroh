import { z } from '../zod'

export const UserSchema = z
    .object({
        id: z.string(),
        email: z.string(),
        name: z.string(),
        surname: z.string().nullable(),
        onBoardingStep: z.number(),
        onBoardingAt: z.string().nullable(),
        image: z.string().nullable(),
        emailVerified: z.boolean(),
        snapshotFrequency: z.string(),
        preferredCurrency: z.string(),
        preferredLanguage: z.string(),
        dateFormat: z.string(),
        country: z.string(),
        timezone: z.string(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })
    .openapi('User')
