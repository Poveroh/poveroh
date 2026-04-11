import { z } from '../zod'
import {
    AppearanceModeEnum,
    CurrencyEnum,
    CyclePeriodEnum,
    FinancialAccountTypeEnum,
    RememberPeriodEnum
} from './enum.schema'
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
        title: z.string().nonempty(),
        description: z.string(),
        amount: z.number().nonnegative(),
        currency: CurrencyEnum,
        appearanceMode: AppearanceModeEnum,
        appearanceLogoIcon: z.string(),
        appearanceIconColor: z.string(),
        firstPayment: z.string().datetime(),
        cycleNumber: z.number().positive(),
        cyclePeriod: CyclePeriodEnum,
        rememberPeriod: RememberPeriodEnum,
        financialAccountId: z.string().nonempty(),
        isEnabled: z.boolean(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().optional()
    })
    .openapi('Subscription')

/**
 * Response schema for getting subscription data (excluding userId and deletedAt)
 * This is the real Dto used for responses, while SubscriptionSchema is the completed one
 * similar to Schema in DB
 */
export const SubscriptionDataSchema = SubscriptionSchema.omit({
    userId: true,
    deletedAt: true
}).openapi('SubscriptionData')

/**
 * Response schema for getting a list of subscriptions
 */
export const GetSubscriptionListResponseSchema = SuccessResponseSchema(SubscriptionDataSchema.array()).openapi(
    'GetSubscriptionListResponse'
)

/**
 * Response schema for getting a single subscription by ID
 */
export const GetSubscriptionResponseSchema =
    SuccessResponseSchema(SubscriptionDataSchema).openapi('GetSubscriptionResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for creating a new subscription
 */
export const CreateSubscriptionRequestSchema = SubscriptionSchema.omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('CreateSubscriptionRequest')

export const CreateSubscriptionMultipartRequestSchema = MultipartRequestSchema(CreateSubscriptionRequestSchema).openapi(
    'CreateSubscriptionMultipartRequest'
)

/**
 * Response schema for creating a new subscription
 */
export const CreateSubscriptionResponseSchema =
    SuccessResponseSchema(SubscriptionDataSchema).openapi('CreateSubscriptionResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating an existing subscription
 */
export const UpdateSubscriptionRequestSchema = SubscriptionSchema.partial()
    .omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true
    })
    .openapi('UpdateSubscriptionRequest')

export const UpdateSubscriptionMultipartRequestSchema = MultipartRequestSchema(UpdateSubscriptionRequestSchema).openapi(
    'UpdateSubscriptionMultipartRequest'
)

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
    .openapi('SubscriptionFilters')

/**
 * Query schema for subscription filters
 */
export const QuerySubscriptionFiltersSchema =
    ReadQuerySchema(SubscriptionFiltersSchema).openapi('QuerySubscriptionFilters')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Subscription form schema representing the data structure for subscription creation and editing forms
 */
export const SubscriptionFormSchema = CreateSubscriptionRequestSchema.openapi('SubscriptionForm')

/*
 * Union schema for create and update subscription requests, allowing for flexible handling of both operations
 */
export const CreateUpdateSubscriptionRequestSchema = z
    .union([CreateSubscriptionRequestSchema, UpdateSubscriptionRequestSchema])
    .openapi('CreateUpdateSubscriptionRequest')
