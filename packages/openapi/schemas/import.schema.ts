import { z } from '../zod'

export const ImportFileSchema = z
    .object({
        id: z.string(),
        importId: z.string(),
        filename: z.string(),
        filetype: z.string(),
        path: z.string(),
        createdAt: z.string().datetime()
    })
    .openapi('ImportFile')

export const ImportSchema = z
    .object({
        id: z.string(),
        userId: z.string(),
        title: z.string(),
        financialAccountId: z.string(),
        status: z.string(),
        createdAt: z.string().datetime(),
        transactions: z.array(z.any()).optional(),
        files: z.array(ImportFileSchema).optional()
    })
    .openapi('Import')

export const ImportRequestSchema = z
    .object({
        title: z.string(),
        financialAccountId: z.string(),
        files: z.array(z.object({ filename: z.string(), filetype: z.string(), path: z.string() })).optional()
    })
    .openapi('ImportRequest')

export const ImportResponseSchema = z
    .object({
        data: ImportSchema
    })
    .openapi('ImportResponse')
