import { z } from '../zod'

export const SubscriptionSchema = z
    .object({
        id: z.string(),
        userId: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        amount: z.number(),
        currency: z.string(),
        appearanceMode: z.string(),
        appearanceLogoIcon: z.string(),
        firstPayment: z.string().datetime(),
        cycleNumber: z.string(),
        cyclePeriod: z.string(),
        rememberPeriod: z.string(),
        financialAccountId: z.string(),
        isEnabled: z.boolean(),
        createdAt: z.string().datetime()
    })
    .openapi('Subscription')

export const SubscriptionRequestSchema = z
    .object({
        title: z.string(),
        description: z.string().nullable().optional(),
        amount: z.number(),
        currency: z.string(),
        appearanceMode: z.string(),
        appearanceLogoIcon: z.string(),
        firstPayment: z.string().datetime(),
        cycleNumber: z.string(),
        cyclePeriod: z.string(),
        rememberPeriod: z.string(),
        financialAccountId: z.string(),
        isEnabled: z.boolean().optional()
    })
    .openapi('SubscriptionRequest')

export const SubscriptionResponseSchema = z
    .object({
        data: SubscriptionSchema
    })
    .openapi('SubscriptionResponse')
