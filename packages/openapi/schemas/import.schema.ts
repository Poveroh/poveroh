import { z } from '../zod'
import {
    CurrencyEnum,
    EnrichmentStrategyEnum,
    FileTypeEnum,
    ImportSourceEnum,
    ImportStatusEnum,
    ImportTransactionStatusEnum,
    TransactionActionEnum
} from './enum.schema'
import { DateFilterSchema, ReadQuerySchema, StringFilterSchema } from './filter.schema'
import { MultipartRequestSchema } from './media.schema'
import { SuccessResponseSchema } from './response.schema'
import { TransactionSchema } from './transaction.schema'
import { CategoryDataSchema } from './category.schema'

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
        financialAccountId: z.string().nonempty(),
        status: ImportStatusEnum,
        source: ImportSourceEnum,
        sourceReference: z.string().nullable(),
        bankConnectionId: z.string().uuid().nullable(),
        autoApprove: z.boolean(),
        failureReason: z.string().nullable(),
        transactions: z.array(TransactionSchema).optional(),
        files: z.array(ImportFileSchema).optional(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().optional()
    })
    .openapi('Import')

/**
 * Response schema for getting import data (excluding userId and deletedAt)
 * This is the real Dto used for responses, while ImportSchema is the completed one
 * similar to Schema in DB
 */
export const ImportDataSchema = ImportSchema.omit({
    userId: true,
    deletedAt: true
}).openapi('ImportData')

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
export const GetImportListResponseSchema = SuccessResponseSchema(ImportDataSchema.array()).openapi(
    'GetImportListResponse'
)

/**
 * Response schema for getting a single import by ID
 */
export const GetImportResponseSchema = SuccessResponseSchema(ImportDataSchema).openapi('GetImportResponse')

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
})
    // Sent as multipart/form-data, where every field arrives as a string, hence the coercion
    .extend({ autoApprove: z.coerce.boolean().optional().default(false) })
    .openapi('CreateImportRequest')

/**
 * Request schema for creating a new import with multipart/form-data
 */
export const CreateImportMultipartRequestSchema =
    MultipartRequestSchema(CreateImportRequestSchema).openapi('CreateImportMultipartRequest')

/**
 * Response schema for creating a new import
 */
export const CreateImportResponseSchema = SuccessResponseSchema(ImportDataSchema).openapi('CreateImportResponse')

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
export const UpdateImportResponseSchema = SuccessResponseSchema(ImportDataSchema).openapi('UpdateImportResponse')

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
        source: ImportSourceEnum.optional(),
        status: ImportStatusEnum.optional(),
        date: DateFilterSchema.optional(),
        includeTransactions: z.boolean().optional().default(true)
    })
    .partial()
    .openapi('ImportFilters')

/**
 * Query schema for import filters
 */
export const QueryImportFiltersSchema = ReadQuerySchema(ImportFiltersSchema).openapi('QueryImportFilters')

/*
 * Union schema for create and update import requests, allowing for flexible handling of both operations
 */
export const CreateUpdateImportRequestSchema = z
    .union([CreateImportRequestSchema, UpdateImportRequestSchema])
    .openapi('CreateUpdateImportRequest')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Import form schema representing the data structure for import creation and editing forms.
 * Kept separate from the request schema, whose `autoApprove` default would make the form's input
 * and output types diverge and break the resolver's inference.
 */
export const ImportFormSchema = ImportSchema.pick({
    financialAccountId: true
})
    // Optional rather than defaulted: a default would make the schema's input and output types
    // diverge, which breaks the form resolver's inference.
    .extend({ autoApprove: z.boolean().optional() })
    .openapi('ImportForm')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Single item in the bulk approve/reject request
 */
export const ApproveImportTransactionItemSchema = z
    .object({
        transactionId: z.string().nonempty(),
        status: ImportTransactionStatusEnum
    })
    .openapi('ApproveImportTransactionItem')

/**
 * Request schema for bulk approving/rejecting import transactions
 */
export const ApproveImportTransactionsRequestSchema = z
    .object({
        transactions: z.array(ApproveImportTransactionItemSchema).nonempty()
    })
    .openapi('ApproveImportTransactionsRequest')

/**
 * Response schema for bulk approving/rejecting import transactions
 */
export const ApproveImportTransactionsResponseSchema = SuccessResponseSchema(
    ImportTransactionDataResponseSchema.array()
).openapi('ApproveImportTransactionsResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * A normalized transaction ready to be turned into an import transaction, whatever the source that
 * produced it: the CSV parser, a bank-sync provider, or a future integration. `externalTransactionId`
 * and `bankSyncAccountId` are only set by sources that have a stable external identity to dedupe on.
 */
export const ImportCandidateTransactionSchema = z
    .object({
        date: z.string().datetime(),
        title: z.string().nonempty(),
        amount: z.number(),
        currency: CurrencyEnum,
        action: TransactionActionEnum,
        externalTransactionId: z.string().nullable().optional(),
        bankSyncAccountId: z.string().uuid().nullable().optional(),
        rawRow: z.array(z.string()).optional()
    })
    .openapi('ImportCandidateTransaction')

/**
 * The single entry point of the import flow: everything needed to open an import, whatever its
 * source. `transactions` is set by sources that deliver already-normalized rows; a CSV import
 * leaves it empty because its rows are parsed from the uploaded files by the worker.
 */
export const ImportIngestionRequestSchema = z
    .object({
        source: ImportSourceEnum,
        financialAccountId: z.string().uuid(),
        autoApprove: z.boolean().default(false),
        sourceReference: z.string().nullable().optional(),
        bankConnectionId: z.string().uuid().nullable().optional(),
        transactions: z.array(ImportCandidateTransactionSchema).optional()
    })
    .openapi('ImportIngestionRequest')

/**
 * The fields an enrichment strategy can contribute to a candidate transaction
 */
export const ImportEnrichmentSchema = z
    .object({
        title: z.string().optional(),
        categoryId: z.string().uuid().nullable().optional(),
        subcategoryId: z.string().uuid().nullable().optional(),
        subscriptionId: z.string().uuid().nullable().optional(),
        icon: z.string().nullable().optional(),
        note: z.string().nullable().optional()
    })
    .openapi('ImportEnrichment')

/**
 * An enrichment tagged with the strategy that produced it
 */
export const ImportEnrichmentResultSchema = ImportEnrichmentSchema.extend({
    strategy: EnrichmentStrategyEnum
}).openapi('ImportEnrichmentResult')

/**
 * The import-wide values the processing step needs: where to read the candidates from, which
 * account their amounts belong to, and whether they should skip review
 */
export const ImportProcessingTargetSchema = z
    .object({
        source: ImportSourceEnum,
        financialAccountId: z.string().uuid(),
        bankConnectionId: z.string().uuid().nullable(),
        autoApprove: z.boolean()
    })
    .openapi('ImportProcessingTarget')

/**
 * A candidate transaction after enrichment: everything the repository needs to persist a
 * transaction and its amount. This is the type that crosses the module boundary, so no Prisma
 * input type has to.
 */
export const ImportTransactionDraftSchema = z
    .object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        importId: z.string().uuid(),
        financialAccountId: z.string().uuid(),
        date: z.string().datetime(),
        title: z.string().nonempty(),
        action: TransactionActionEnum,
        amount: z.number(),
        currency: CurrencyEnum,
        categoryId: z.string().uuid().nullable(),
        subcategoryId: z.string().uuid().nullable(),
        subscriptionId: z.string().uuid().nullable(),
        icon: z.string().nullable(),
        note: z.string().nullable(),
        bankConnectionId: z.string().uuid().nullable(),
        bankSyncAccountId: z.string().uuid().nullable(),
        externalTransactionId: z.string().nullable()
    })
    .openapi('ImportTransactionDraft')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Enum representing the available template import actions that can be performed when importing templates
 */
export const ImportTemplateActionEnum = z.enum(['categories']).openapi('ImportTemplateActionEnum')

/**
 * Params schema for import template action
 */
export const ImportTemplateActionParams = z
    .object({
        action: ImportTemplateActionEnum
    })
    .openapi('ImportTemplateActionParams')

/**
 * Response schema for import template action
 */
export const CreateImportTemplateResponseSchema = SuccessResponseSchema(CategoryDataSchema.array()).openapi(
    'CreateImportTemplateResponse'
)
