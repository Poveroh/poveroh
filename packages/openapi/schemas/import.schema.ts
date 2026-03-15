import { z } from '../zod'
import { FileTypeEnum, TransactionStatusEnum } from './enum.schema'
import { DateFilterSchema, ReadQuerySchema, StringFilterSchema } from './filter.schema'
import { MultipartRequestSchema } from './media.schema'
import { SuccessResponseSchema } from './response.schema'
import { TransactionSchema } from './transaction.schema'

/**
 * Import file schema representing a file associated with an import operation
 */
export const ImportFileSchema = z
    .object({
        id: z.string(),
        importId: z.string().uuid(),
        filename: z.string(),
        filetype: FileTypeEnum,
        path: z.string(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().optional()
    })
    .openapi('ImportFile')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Create import file request schema representing the structure of a request to create a new import file
 */
export const ImportSchema = z
    .object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        title: z.string(),
        financialAccountId: z.string().uuid(),
        status: TransactionStatusEnum,
        transactions: z.array(TransactionSchema).optional(),
        files: z.array(ImportFileSchema).optional(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().optional()
    })
    .openapi('Import')

/**
 * Response schema for getting import data (excluding userId and deletedAt)
 */
export const ImportDataSchema = ImportSchema.omit({
    userId: true,
    deletedAt: true
}).openapi('ImportData')

/**
 * Response schema for getting import data (excluding userId and deletedAt)
 */
export const ImportDataResponseSchema = ImportDataSchema.openapi('ImportDataResponse')

/**
 * Response schema for getting transaction data (excluding userId and deletedAt)
 */
export const ImportTransactionDataResponseSchema = TransactionSchema.omit({
    userId: true,
    importId: true,
    deletedAt: true
}).openapi('ImportTransactionDataResponse')

/**
 * Response schema for getting a list of imports
 */
export const GetImportListResponseSchema = SuccessResponseSchema(ImportDataResponseSchema.array()).openapi(
    'GetImportListResponse'
)

/**
 * Response schema for getting a single import by ID
 */
export const GetImportResponseSchema = SuccessResponseSchema(ImportDataResponseSchema).openapi('GetImportResponse')

/**
 * Response schema for getting a list of transactions for a specific import
 */
export const GetImportTransactionsResponseSchema = SuccessResponseSchema(
    ImportTransactionDataResponseSchema.array()
).openapi('GetImportTransactionsResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for creating a new import
 */
export const CreateImportRequestSchema = ImportSchema.pick({
    financialAccountId: true
}).openapi('CreateImportRequest')

/**
 * Request schema for creating a new import with multipart/form-data
 */
export const CreateImportMultipartRequestSchema =
    MultipartRequestSchema(CreateImportRequestSchema).openapi('CreateImportMultipartRequest')

/**
 * Response schema for creating a new import
 */
export const CreateImportResponseSchema =
    SuccessResponseSchema(ImportDataResponseSchema).openapi('CreateImportResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating an existing import
 */
export const UpdateImportRequestSchema = ImportSchema.partial()
    .pick({
        title: true
    })
    .openapi('UpdateImportRequest')

/**
 * Response schema for updating an existing import
 */
export const UpdateImportResponseSchema =
    SuccessResponseSchema(ImportDataResponseSchema).openapi('UpdateImportResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Response schema for deleting an import
 */
export const DeleteImportResponseSchema = SuccessResponseSchema().openapi('DeleteImportResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Response schema for import operations
 */
export const ImportParamsId = ImportSchema.pick({
    id: true
}).openapi('ImportParamsId')

/**
 * Import filters schema representing the structure of filters that can be applied when querying imports
 */
export const ImportFiltersSchema = z
    .object({
        id: ImportParamsId,
        title: StringFilterSchema.optional(),
        date: DateFilterSchema.optional(),
        includeTransactions: z.boolean().optional().default(true)
    })
    .partial()
    .catchall(z.union([z.string(), StringFilterSchema, DateFilterSchema]))
    .openapi('ImportFilters')

/**
 * Query schema for import filters
 */
export const QueryImportFiltersSchema = ReadQuerySchema(ImportFiltersSchema).openapi('QueryImportFilters')
