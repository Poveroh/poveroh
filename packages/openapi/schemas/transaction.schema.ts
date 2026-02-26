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
