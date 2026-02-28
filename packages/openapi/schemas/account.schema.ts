import { z } from '../zod'
import { FinancialAccountTypeEnum } from './enum.schema'

export const FinancialAccountSchema = z
    .object({
        id: z.string(),
        userId: z.string(),
        title: z.string(),
        description: z.string(),
        balance: z.number(),
        type: FinancialAccountTypeEnum,
        logoIcon: z.string(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })
    .openapi('FinancialAccount')

export const FinancialAccountRequestSchema = FinancialAccountSchema.omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true
}).openapi('FinancialAccountRequest')

export const FinancialAccountResponseSchema = z
    .object({
        data: FinancialAccountSchema
    })
    .openapi('FinancialAccountResponse')
