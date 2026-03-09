import { z } from '../zod'
import { SuccessResponseSchema } from './response.schema'
import {
    SnapshotFrequencyEnum,
    CurrencyEnum,
    LanguageEnum,
    DateFormatEnum,
    TimezoneEnum,
    CountriesEnum,
    OnBoardingStepEnum
} from './enum.schema'

/**
 * User preferences schema representing a user's settings and preferences
 */
export const UserPreferencesSchema = z
    .object({
        snapshotFrequency: SnapshotFrequencyEnum,
        preferredCurrency: CurrencyEnum,
        preferredLanguage: LanguageEnum,
        dateFormat: DateFormatEnum,
        country: CountriesEnum,
        timezone: TimezoneEnum
    })
    .openapi('UserPreferences')

/**
 * User schema representing a user in the system
 */
export const UserSchema = z
    .object({
        id: z.string().uuid(),
        name: z.string().min(1),
        surname: z.string().min(1),
        email: z.string().email(),
        emailVerified: z.boolean().default(false),
        onBoardingStep: OnBoardingStepEnum.default('EMAIL'),
        onBoardingAt: z.date().nullable(),
        image: z.string().url().nullable(),

        createdAt: z.date(),
        updatedAt: z.date()
    })
    .extend(UserPreferencesSchema.shape)
    .openapi('User')

/**
 * Response schema for getting authenticated user
 */
export const GetUserResponseSchema = SuccessResponseSchema(UserSchema).openapi('GetUserResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating user information and preferences
 */
export const UpdateUserSchemaRequest = UserSchema.partial().openapi('UpdateUserRequest')

/**
 * Response schema for updating authenticated user
 */
export const UpdateUserResponseSchema = SuccessResponseSchema(UserSchema).openapi('UpdateUserResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * User session schema representing an authenticated user session
 */
export const UserSessionSchema = z
    .object({
        session: z.object({
            id: z.string().uuid(),
            createdAt: z.date(),
            updatedAt: z.date(),
            userId: z.string().uuid(),
            expiresAt: z.date(),
            token: z.string(),
            ipAddress: z.string().ip().nullable(),
            userAgent: z.string().nullable()
        }),
        user: UserSchema
    })
    .openapi('UserSession')

/**
 * User login schema representing the data required for a user to authenticate and create a session
 */
export const UserLoginSchema = z
    .object({
        email: z.string().nonempty().email(),
        password: z.string().nonempty().min(6)
    })
    .openapi('UserLogin')
