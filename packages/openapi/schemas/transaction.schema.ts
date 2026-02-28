import { z } from '../zod'

export const TransactionSchema = z
    .object({
        id: z.string(),
        userId: z.string(),
        title: z.string(),
        action: z.string(), // enum se serve
        categoryId: z.string().nullable(),
        subcategoryId: z.string().nullable(),
        icon: z.string().nullable(),
        date: z.string().datetime(),
        note: z.string().nullable(),
        ignore: z.boolean(),
        createdAt: z.string().datetime(),
        status: z.string(), // enum se serve
        importId: z.string().nullable(),
        updatedAt: z.string().datetime(),
        amounts: z.array(z.any()), // da collegare a AmountSchema
        media: z.array(z.any()), // da collegare a TransactionMediaSchema
        transferId: z.string().nullable(),
        transferHash: z.string().nullable()
    })
    .openapi('Transaction')

export const TransactionRequestSchema = z
    .object({
        title: z.string(),
        date: z.string().datetime(),
        action: z.string(),
        categoryId: z.string().nullable().optional(),
        subcategoryId: z.string().nullable().optional(),
        icon: z.string().nullable().optional(),
        note: z.string().nullable().optional(),
        ignore: z.boolean().optional(),
        importId: z.string().nullable().optional(),
        amounts: z.array(z.any()).optional(),
        media: z.array(z.any()).optional(),
        transferId: z.string().nullable().optional()
    })
    .openapi('TransactionRequest')

export const TransactionResponseSchema = z
    .object({
        data: TransactionSchema
    })
    .openapi('TransactionResponse')
