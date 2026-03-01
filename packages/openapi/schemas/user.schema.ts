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

export const UpdateUserSchemaRequest = UserSchema.partial().openapi('UpdateUserRequest')

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

export const UserLoginSchema = z
    .object({
        email: z.string().nonempty().email(),
        password: z.string().nonempty().min(6)
    })
    .openapi('UserLogin')
