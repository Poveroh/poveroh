import { z } from '../zod'
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
 * Includes fields for snapshot frequency, preferred currency, language, date format, country, and timezone
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
 * It extends the UserPreferencesSchema to include user settings and preferences along with basic user information
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
 * Request schema for updating user information and preferences
 * It makes all fields optional to allow partial updates while still validating the structure of the data
 */
export const UpdateUserSchemaRequest = UserSchema.partial().openapi('UpdateUserRequest')

/**
 * User session schema representing an authenticated user session
 * Includes fields for session details such as session ID, creation and expiration timestamps, user information, and optional fields for IP address and user agent to provide context about the session
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
 * Includes fields for email and password, both of which are required and validated to ensure they meet the necessary criteria for authentication (email format and minimum password length)
 */
export const UserLoginSchema = z
    .object({
        email: z.string().nonempty().email(),
        password: z.string().nonempty().min(6)
    })
    .openapi('UserLogin')
