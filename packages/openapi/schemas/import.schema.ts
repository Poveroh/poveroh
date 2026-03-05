import { z } from '../zod'
import { FileTypeEnum, TransactionStatusEnum } from './enum.schema'
import { TransactionSchema } from './transaction.schema'

/**
 * Import file schema representing a file associated with an import operation
 * It includes fields for file details such as filename, filetype, path, and timestamps
 */
export const ImportFileSchema = z
    .object({
        id: z.string(),
        importId: z.string().uuid(),
        filename: z.string(),
        filetype: FileTypeEnum,
        path: z.string(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })
    .openapi('ImportFile')

export const ImportSchema = z
    .object({
        id: z.string(),
        userId: z.string(),
        title: z.string(),
        financialAccountId: z.string().uuid(),
        status: TransactionStatusEnum.default('IMPORT_PENDING'),
        transactions: z.array(TransactionSchema),
        files: z.array(ImportFileSchema),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })
    .openapi('Import')

export const ImportRequestSchema = z
    .object({
        title: z.string(),
        financialAccountId: z.string().uuid(),
        files: z.array(z.object({ filename: z.string(), filetype: z.string(), path: z.string() })).optional()
    })
    .openapi('ImportRequest')

export const ImportResponseSchema = z
    .object({
        data: ImportSchema
    })
    .openapi('ImportResponse')
