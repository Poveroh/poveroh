import { z } from '../zod'
import { AppearanceModeEnum, CurrencyEnum, FinancialAccountTypeEnum, RememberPeriodEnum } from './enum.schema'
import { ReadQuerySchema, StringFilterSchema } from './filter.schema'
import { MultipartRequestSchema } from './media.schema'
import { SuccessResponseSchema } from './response.schema'

/**
 * Subscription schema representing a user's subscription
 */
export const SubscriptionSchema = z
    .object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        title: z.string(),
        description: z.string(),
        amount: z.number(),
        currency: CurrencyEnum,
        appearanceMode: AppearanceModeEnum,
        appearanceLogoIcon: z.string(),
        firstPayment: z.string().datetime(),
        cycleNumber: z.number(),
        cyclePeriod: z.string(),
        rememberPeriod: RememberPeriodEnum,
        financiaAccountId: z.string().uuid(),
        isEnabled: z.boolean(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })
    .openapi('Subscription')

/**
 * Response schema for getting a list of subscriptions
 */
export const GetSubscriptionListResponseSchema = SuccessResponseSchema(SubscriptionSchema.array()).openapi(
    'GetSubscriptionListResponse'
)

/**
 * Response schema for getting a single subscription by ID
 */
export const GetSubscriptionResponseSchema =
    SuccessResponseSchema(SubscriptionSchema).openapi('GetSubscriptionResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for creating a new subscription
 */
export const CreateSubscriptionRequestSchema = SubscriptionSchema.omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true
}).openapi('CreateSubscriptionRequest')

export const CreateSubscriptionMultipartRequestSchema = MultipartRequestSchema(CreateSubscriptionRequestSchema).openapi(
    'CreateSubscriptionMultipartRequest'
)

/**
 * Response schema for creating a new subscription
 */
export const CreateSubscriptionResponseSchema =
    SuccessResponseSchema(SubscriptionSchema).openapi('CreateSubscriptionResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating an existing subscription
 */
export const UpdateSubscriptionRequestSchema = SubscriptionSchema.partial()
    .omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true
    })
    .openapi('UpdateSubscriptionRequest')

/**
 * Response schema for updating an existing subscription
 */
export const UpdateSubscriptionResponseSchema = SuccessResponseSchema().openapi('UpdateSubscriptionResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Response schema for deleting a subscription
 */
export const DeleteSubscriptionResponseSchema = SuccessResponseSchema().openapi('DeleteSubscriptionResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Response schema for subscription operations
 */
export const SubscriptionParamsId = SubscriptionSchema.pick({
    id: true
}).openapi('SubscriptionParamsId')

/**
 * Subscription filters schema representing the structure of filters that can be applied when querying subscriptions
 */
export const SubscriptionFiltersSchema = z
    .object({
        id: SubscriptionParamsId,
        title: StringFilterSchema.optional(),
        description: StringFilterSchema.optional(),
        type: FinancialAccountTypeEnum.optional()
    })
    .partial()
    .catchall(z.union([z.string(), StringFilterSchema, FinancialAccountTypeEnum]))
    .openapi('SubscriptionFilters')

/**
 * Query schema for subscription filters
 */
export const QuerySubscriptionFiltersSchema =
    ReadQuerySchema(SubscriptionFiltersSchema).openapi('QuerySubscriptionFilters')
