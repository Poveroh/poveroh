import { z } from '../zod'
import { CurrencyEnum, TransactionActionEnum, TransactionStatusEnum } from './enum.schema'
import { DateFilterSchema, ReadQuerySchema, StringFilterSchema } from './filter.schema'
import { MultipartRequestSchema } from './media.schema'
import { SuccessResponseSchema } from './response.schema'

/**
 * Transaction media schema representing media files associated with a transaction
 */
export const TransactionMediaSchema = z
    .object({
        id: z.string(),
        transactionId: z.string().uuid(),
        filename: z.string(),
        filetype: z.string(),
        path: z.string().url(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().optional()
    })
    .openapi('TransactionMedia')

/**
 * Create transaction media request schema representing the structure of a request to create a new transaction media
 */
export const CreateTransactionMediaRequestSchema = TransactionMediaSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('CreateTransactionMediaRequest')

export const CreateTransactionMediaMultipartRequestSchema = MultipartRequestSchema(
    CreateTransactionMediaRequestSchema
).openapi('CreateTransactionMediaMultipartRequest')

/**
 * Response schema for transaction media operations
 */
export const TransactionMediaParamsId = TransactionMediaSchema.pick({
    id: true
}).openapi('TransactionMediaParamsId')

/**
 * Transaction media filters schema representing the structure of filters that can be applied when querying transaction media
 */
export const TransactionMediaFiltersSchema = z
    .object({
        id: TransactionMediaParamsId,
        transactionId: z.string().uuid(),
        filetype: StringFilterSchema.optional()
    })
    .partial()
    .catchall(z.union([z.string(), StringFilterSchema]))
    .openapi('TransactionMediaFilters')

// ----------------------------------------------------------------------------------------------------------------------------

/**
 * Amount schema representing the amount details of a transaction
 */
export const AmountSchema = z
    .object({
        id: z.string(),
        transactionId: z.string().uuid(),
        amount: z.number(),
        currency: CurrencyEnum,
        action: TransactionActionEnum,
        financialAccountId: z.string().uuid(),
        importReferenceId: z.string().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().optional()
    })
    .openapi('Amount')

/**
 * Create amount request schema representing the structure of a request to create a new amount
 */
export const CreateAmountRequestSchema = AmountSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('CreateAmountRequest')

/**
 * Response schema for amount operations
 */
export const AmountParamsId = AmountSchema.pick({
    id: true
}).openapi('AmountParamsId')

// ----------------------------------------------------------------------------------------------------------------------------

/**
 * Transaction schema representing a financial transaction in the system
 */
export const TransactionSchema = z
    .object({
        id: z.string(),
        userId: z.string(),
        date: z.string().datetime(),
        title: z.string(),
        note: z.string().nullable(),
        icon: z.string().nullable(),
        categoryId: z.string().nullable(),
        subcategoryId: z.string().nullable(),
        importId: z.string().nullable(),
        action: TransactionActionEnum,
        status: TransactionStatusEnum,
        ignore: z.boolean(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().optional(),
        media: z.array(TransactionMediaSchema),
        amounts: z.array(AmountSchema),
        transferId: z.string().nullable(),
        transferHash: z.string().nullable()
    })
    .openapi('Transaction')

/**
 * Response schema for getting transaction data (excluding userId and deletedAt)
 */
export const TransactionDataResponseSchema = TransactionSchema.omit({
    userId: true,
    deletedAt: true
}).openapi('TransactionDataResponse')

/**
 * Response schema for getting a list of transactions
 */
export const GetTransactionListResponseSchema = SuccessResponseSchema(TransactionDataResponseSchema.array()).openapi(
    'GetTransactionListResponse'
)

/**
 * Response schema for getting a single transaction by ID
 */
export const GetTransactionResponseSchema =
    SuccessResponseSchema(TransactionDataResponseSchema).openapi('GetTransactionResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Create transaction request schema representing the structure of a request to create a new transaction
 */
export const CreateTransactionRequestSchema = TransactionSchema.omit({
    id: true,
    userId: true,
    createdAt: true,
    status: true,
    importId: true,
    updatedAt: true,
    deletedAt: true,
    amounts: true,
    action: true,
    media: true,
    transferId: true,
    transferHash: true
}).openapi('CreateTransactionRequest')

export const CreateTransactionMultipartRequestSchema = MultipartRequestSchema(CreateTransactionRequestSchema).openapi(
    'CreateTransactionMultipartRequest'
)

/**
 * Response schema for creating a new transaction
 */
export const CreateTransactionResponseSchema =
    SuccessResponseSchema(TransactionDataResponseSchema).openapi('CreateTransactionResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating an existing transaction
 */
export const UpdateTransactionRequestSchema = TransactionSchema.partial()
    .omit({
        id: true,
        userId: true,
        createdAt: true,
        status: true,
        importId: true,
        updatedAt: true,
        deletedAt: true,
        amounts: true,
        action: true,
        media: true,
        transferId: true,
        transferHash: true
    })
    .openapi('UpdateTransactionRequest')

/**
 * Response schema for updating an existing transaction
 */
export const UpdateTransactionResponseSchema = SuccessResponseSchema().openapi('UpdateTransactionResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Response schema for deleting a transaction
 */
export const DeleteTransactionResponseSchema = SuccessResponseSchema().openapi('DeleteTransactionResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Response schema for transaction operations
 */
export const TransactionParamsId = TransactionSchema.pick({
    id: true
}).openapi('TransactionParamsId')

/**
 * Transaction filters schema representing the structure of filters that can be applied when querying transactions
 */
export const TransactionFiltersSchema = z
    .object({
        id: TransactionParamsId,
        title: StringFilterSchema,
        note: StringFilterSchema,
        action: TransactionActionEnum,
        categoryId: z.string().uuid(),
        subcategoryId: z.string().uuid(),
        financialAccountId: z.string().uuid(),
        date: DateFilterSchema
    })
    .partial()
    .catchall(z.union([z.string(), StringFilterSchema, TransactionActionEnum]))
    .openapi('TransactionFilters')

/**
 * Query schema for transaction filters
 */
export const QueryTransactionFiltersSchema =
    ReadQuerySchema(TransactionFiltersSchema).openapi('QueryTransactionFilters')
