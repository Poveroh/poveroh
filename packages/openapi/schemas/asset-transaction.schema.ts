import { z } from '../zod'
import { AssetTransactionTypeEnum, CurrencyEnum } from './enum.schema'
import { DateFilterSchema, ReadQuerySchema, StringFilterSchema } from './filter.schema'
import { SuccessResponseSchema } from './response.schema'

/**
 * Asset transaction schema representing a transaction linked to an asset
 */
export const AssetTransactionSchema = z
    .object({
        id: z.uuid(),
        assetId: z.uuid(),
        type: AssetTransactionTypeEnum,
        date: z.string(),
        settlementDate: z.string(),
        quantityChange: z.number(),
        unitPrice: z.number(),
        totalAmount: z.number(),
        currency: CurrencyEnum,
        fxRate: z.number().nullable(),
        fees: z.number().nullable(),
        taxAmount: z.number().nullable(),
        financialAccountId: z.uuid().nullable(),
        note: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable()
    })
    .openapi('AssetTransaction')

/**
 * Response schema for getting asset transaction data (excluding deletedAt)
 */
export const AssetTransactionDataSchema = AssetTransactionSchema.omit({
    deletedAt: true
}).openapi('AssetTransactionData')

/**
 * Response schema for getting a list of asset transactions
 */
export const GetAssetTransactionListResponseSchema = SuccessResponseSchema(AssetTransactionDataSchema.array()).openapi(
    'GetAssetTransactionListResponse'
)

/**
 * Response schema for getting a single asset transaction by ID
 */
export const GetAssetTransactionResponseSchema =
    SuccessResponseSchema(AssetTransactionDataSchema).openapi('GetAssetTransactionResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Asset transaction form schema representing the data structure for asset transaction creation and editing forms
 */
export const AssetTransactionFormSchema = AssetTransactionSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('AssetTransactionForm')

/**
 * Cross-field rules applied on top of AssetTransactionFormSchema:
 * - Certain transaction types require quantityChange
 * - BUY and SELL require either unitPrice or totalAmount
 */
const refineAssetTransactionRules = <T extends z.ZodTypeAny>(schema: T) =>
    schema.superRefine((data: any, ctx) => {
        if (!data?.type) return

        const quantityRequiredTypes = new Set(['BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL', 'CAPITAL_CALL', 'DISTRIBUTION'])
        if (quantityRequiredTypes.has(data.type) && data.quantityChange == null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['quantityChange'],
                message: `quantityChange is required for transaction type ${data.type}`
            })
        }

        const priceRequiredTypes = new Set(['BUY', 'SELL'])
        if (priceRequiredTypes.has(data.type) && data.unitPrice == null && data.totalAmount == null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['unitPrice'],
                message: `unitPrice or totalAmount is required for transaction type ${data.type}`
            })
        }
    })

/**
 * Request schema for creating a new asset transaction
 */
export const CreateAssetTransactionRequestSchema = refineAssetTransactionRules(AssetTransactionFormSchema).openapi(
    'CreateAssetTransactionRequest'
)

/**
 * Request schema for updating an existing asset transaction
 */
export const UpdateAssetTransactionRequestSchema = refineAssetTransactionRules(
    AssetTransactionFormSchema.partial()
).openapi('UpdateAssetTransactionRequest')

/**
 * Response schema for creating a new asset transaction
 */
export const CreateAssetTransactionResponseSchema = SuccessResponseSchema(AssetTransactionDataSchema).openapi(
    'CreateAssetTransactionResponse'
)

/**
 * Response schema for updating an existing asset transaction
 */
export const UpdateAssetTransactionResponseSchema = SuccessResponseSchema().openapi('UpdateAssetTransactionResponse')

/**
 * Response schema for deleting an asset transaction
 */
export const DeleteAssetTransactionResponseSchema = SuccessResponseSchema().openapi('DeleteAssetTransactionResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Id parameter schema for referencing specific asset transactions in path parameters
 */
export const AssetTransactionParamsIdSchema = AssetTransactionSchema.pick({
    id: true
}).openapi('AssetTransactionParamsId')

/**
 * Asset transaction filters schema representing the structure of filters that can be applied when querying asset transactions
 */
export const AssetTransactionFiltersSchema = z
    .object({
        id: AssetTransactionParamsIdSchema.optional(),
        assetId: z.string().uuid().optional(),
        type: AssetTransactionTypeEnum.optional(),
        date: DateFilterSchema.optional(),
        financialAccountId: z.string().uuid().optional(),
        note: StringFilterSchema.optional()
    })
    .openapi('AssetTransactionFilters')

/**
 * Query schema for asset transaction filters
 */
export const QueryAssetTransactionFiltersSchema =
    ReadQuerySchema(AssetTransactionFiltersSchema).openapi('QueryAssetTransactionFilters')

/**
 * Union schema for asset transaction creation and updating requests, allowing the same form to be used for both operations with appropriate validation
 */
export const CreateUpdateAssetTransactionRequestSchema = z
    .union([CreateAssetTransactionRequestSchema, UpdateAssetTransactionRequestSchema])
    .openapi('CreateUpdateAssetTransactionRequest')
