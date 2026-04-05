import { z } from '../zod'
import { FinancialAccountTypeEnum } from './enum.schema'
import { ReadQuerySchema, StringFilterSchema } from './filter.schema'
import { MultipartRequestSchema } from './media.schema'
import { SuccessResponseSchema } from './response.schema'

/**
 * Financial account schema representing a user's financial account
 */
export const FinancialAccountSchema = z
    .object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        title: z.string(),
        balance: z.number(),
        type: FinancialAccountTypeEnum,
        logoIcon: z.string(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().optional()
    })
    .openapi('FinancialAccount')

/**
 * Response schema for getting financial account data (excluding userId and deletedAt)
 * This is the real Dto used for responses, while FinancialAccountSchema is the completed one
 * similar to Schema in DB
 */
export const FinancialAccountDataSchema = FinancialAccountSchema.omit({
    userId: true,
    deletedAt: true
}).openapi('FinancialAccountData')

/**
 * Response schema for getting a list of financial accounts
 */
export const GetFinancialAccountListResponseSchema = SuccessResponseSchema(FinancialAccountDataSchema.array()).openapi(
    'GetFinancialAccountListResponse'
)

/**
 * Response schema for getting a single financial account by ID
 */
export const GetFinancialAccountResponseSchema =
    SuccessResponseSchema(FinancialAccountDataSchema).openapi('GetFinancialAccountResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for creating a new financial account
 */
export const CreateFinancialAccountRequestSchema = FinancialAccountSchema.omit({
    id: true,
    userId: true,
    balance: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('CreateFinancialAccountRequest')

/**
 * Request schema for creating a new financial account with multipart/form-data
 */
export const CreateFinancialAccountMultipartRequestSchema = MultipartRequestSchema(
    CreateFinancialAccountRequestSchema
).openapi('CreateFinancialAccountMultipartRequest')

/**
 * Response schema for creating a new financial account
 */
export const CreateFinancialAccountResponseSchema = SuccessResponseSchema(FinancialAccountDataSchema).openapi(
    'CreateFinancialAccountResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating an existing financial account
 */
export const UpdateFinancialAccountRequestSchema = FinancialAccountSchema.partial()
    .omit({
        id: true,
        userId: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true
    })
    .openapi('UpdateFinancialAccountRequest')

/**
 * Request schema for updating an existing financial account with multipart/form-data
 */
export const UpdateFinancialAccountMultipartRequestSchema = MultipartRequestSchema(
    UpdateFinancialAccountRequestSchema
).openapi('UpdateFinancialAccountMultipartRequest')

/**
 * Response schema for updating an existing financial account
 */
export const UpdateFinancialAccountResponseSchema = SuccessResponseSchema().openapi('UpdateFinancialAccountResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Response schema for deleting a financial account
 */
export const DeleteFinancialAccountResponseSchema = SuccessResponseSchema().openapi('DeleteFinancialAccountResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 *  Id parameter schema for referencing specific financial accounts in path parameters
 */
export const FinancialAccountParamsId = FinancialAccountSchema.pick({
    id: true
}).openapi('FinancialAccountParamsId')

/**
 * Financial account filters schema representing the structure of filters that can be applied when querying financial accounts
 */
export const FinancialAccountFiltersSchema = z
    .object({
        id: FinancialAccountParamsId,
        title: StringFilterSchema,
        type: FinancialAccountTypeEnum
    })
    .partial()
    .openapi('FinancialAccountFilters')

/**
 * Query schema for financial account filters
 */
export const QueryFinancialAccountFiltersSchema =
    ReadQuerySchema(FinancialAccountFiltersSchema).openapi('QueryFinancialAccountFilters')

/**
 * Financial account form schema representing the data structure for financial account creation and editing forms
 */
export const FinancialAccountFormSchema = CreateFinancialAccountRequestSchema.openapi('FinancialAccountForm')

/**
 * Union schema for create and update financial account requests, used for form validation when the same form is used for both creating and editing financial accounts
 */
export const CreateUpdateFinancialAccountRequestSchema = z
    .union([CreateFinancialAccountRequestSchema, UpdateFinancialAccountRequestSchema])
    .openapi('CreateUpdateFinancialAccountRequest')
