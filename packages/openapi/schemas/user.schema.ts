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
        emailVerified: z.boolean(),
        onBoardingStep: OnBoardingStepEnum,
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
            ipAddress: z.string().nullable(),
            userAgent: z.string().nullable()
        }),
        user: UserSchema
    })
    .openapi('UserSession')

//------------------------------------------------------------------------------------------------------------------------------

/**
 * User login schema representing the data required for a user to authenticate and create a session
 */
export const UserLoginSchema = z
    .object({
        email: z.string().nonempty().email(),
        password: z.string().nonempty().min(6)
    })
    .openapi('UserLogin')

/**
 * User form preferences schema representing the fields required for user onboarding preferences step
 */
export const UserFormPreferencesFormSchema = UserPreferencesSchema.pick({
    preferredCurrency: true,
    preferredLanguage: true,
    dateFormat: true,
    timezone: true
}).openapi('UserFormPreferencesForm')

/**
 * User form generalities schema representing the basic information required for user onboarding generalities step
 */
export const UserFormGeneralitiesFormSchema = UserSchema.pick({
    name: true,
    surname: true,
    country: true
}).openapi('UserFormGeneralitiesForm')

/**
 * User profile form schema representing the fields required for updating user information in profile settings
 */
export const UserProfileFormSchema = UserSchema.pick({
    name: true,
    surname: true,
    email: true,
    country: true
}).openapi('UserProfileForm')

/**
 * User profile security form schema representing the fields required for updating user password in profile settings
 */
export const UserProfileSecurityFormSchema = z
    .object({
        oldPassword: z.string().min(6),
        newPassword: z.string().min(6),
        confirmPassword: z.string().min(6)
    })
    .refine(data => data.newPassword === data.confirmPassword, {
        path: ['confirmPassword']
    })
    .refine(data => data.oldPassword !== data.newPassword, {
        path: ['newPassword']
    })
    .openapi('UserProfileSecurityForm')
