import { z } from '../zod'
import { SnapshotFrequencyEnum, CurrencyEnum, LanguageEnum, DateFormatEnum, TimezoneEnum } from './enum.schema'

export const UserPreferencesSchema = z
    .object({
        snapshotFrequency: SnapshotFrequencyEnum,
        preferredCurrency: CurrencyEnum,
        preferredLanguage: LanguageEnum,
        dateFormat: DateFormatEnum,
        country: z.string(),
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
        onBoardingStep: z.number().int(),
        onBoardingAt: z.date().nullable(),
        image: z.string().url().nullable(),

        createdAt: z.date(),
        updatedAt: z.date()
    })
    .extend(UserPreferencesSchema.shape)
    .openapi('User')

export const UserLoginSchema = z
    .object({
        email: z.string().nonempty().email(),
        password: z.string().nonempty().min(6)
    })
    .openapi('UserLogin')
