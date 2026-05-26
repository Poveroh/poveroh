import { z } from '../zod'
import { UserActivityActionEnum, UserActivityEntityEnum } from './enum.schema'
import { DateFilterSchema, ReadQuerySchema } from './filter.schema'
import { SuccessResponseSchema } from './response.schema'

/**
 * User activity schema representing a single audit-log entry for a user account.
 * The subject is split into `entityType` (what the activity is about) and `action` (what happened to it).
 */
export const UserActivitySchema = z
    .object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        entityType: UserActivityEntityEnum,
        action: UserActivityActionEnum,
        entityId: z.string().nullable(),
        metadata: z.record(z.string(), z.unknown()).nullable(),
        userAgent: z.string().nullable(),
        createdAt: z.string()
    })
    .openapi('UserActivity')

/**
 * Response schema for getting user activity data (excluding userId)
 * This is the real DTO used for responses, while UserActivitySchema is the completed one similar to the DB row
 */
export const UserActivityDataSchema = UserActivitySchema.omit({ userId: true }).openapi('UserActivityData')

/**
 * Response schema for getting a list of user activities
 */
export const GetUserActivityListResponseSchema = SuccessResponseSchema(UserActivityDataSchema.array()).openapi(
    'GetUserActivityListResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Internal payload used by services to record a new user activity. Not exposed as a public endpoint.
 */
export const CreateUserActivityRequestSchema = z
    .object({
        entityType: UserActivityEntityEnum,
        action: UserActivityActionEnum,
        entityId: z.string().nullable().optional(),
        metadata: z.record(z.string(), z.unknown()).nullable().optional(),
        userAgent: z.string().nullable().optional()
    })
    .openapi('CreateUserActivityRequest')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * User activity filters schema representing the structure of filters that can be applied when querying user activities
 */
export const UserActivityFiltersSchema = z
    .object({
        entityType: UserActivityEntityEnum,
        action: UserActivityActionEnum,
        entityId: z.string(),
        createdAt: DateFilterSchema
    })
    .partial()
    .openapi('UserActivityFilters')

/**
 * Query schema for user activity filters
 */
export const QueryUserActivityFiltersSchema =
    ReadQuerySchema(UserActivityFiltersSchema).openapi('QueryUserActivityFilters')
