import { Currencies } from './currency.js'
import { Language } from './language.js'
import { DateFormat } from './date-format.js'
import { Timezone } from './timezone.js'

export enum OnBoardingStep {
    EMAIL = 1,
    GENERALITIES = 2,
    PREFERENCES = 3,
    COMPLETED = 4
}

export enum SnapshotFrequency {
    NONE = 'NONE',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    SEMIANNUAL = 'SEMIANNUAL',
    ANNUAL = 'ANNUAL'
}

export interface IUserLogin {
    email: string
    password: string
}

export interface IUserBase {
    email: string
    name: string
    surname?: string
}

export interface IUserPreferences {
    preferredCurrency: Currencies
    preferredLanguage: Language
    dateFormat: DateFormat
    country: string
    timezone: Timezone
}

export interface IUser extends IUserBase, IUserPreferences {
    id: string
    onBoardingStep: OnBoardingStep
    onBoardingAt?: string | null
    image?: string | null
    emailVerified: boolean
    snapshotFrequency: SnapshotFrequency
    createdAt: string
    updatedAt: string
}

export interface ISession {
    id: string
    token: string
    userId: string
    expiresAt: string
    ipAddress?: string | null
    userAgent?: string | null
    createdAt: string
    updatedAt: string
}

export interface IAccount {
    id: string
    accountId: string
    providerId: string
    userId: string
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: string | null
    refreshTokenExpiresAt?: string | null
    scope?: string | null
    password?: string | null
    createdAt: string
    updatedAt: string
}

export interface IVerification {
    id: string
    identifier: string
    value: string
    expiresAt: string
    userId?: string | null
    createdAt: string
    updatedAt: string
}

export interface IPasswordToChange {
    oldPassword: string
    newPassword: string
}

export interface IPassword extends IPasswordToChange {
    confirmPassword: string
}

export const defaultUser: IUser = {
    id: '',
    name: '',
    surname: '',
    email: '',
    image: null,
    emailVerified: false,
    onBoardingStep: 1,
    onBoardingAt: null,
    snapshotFrequency: SnapshotFrequency.MONTHLY,
    preferredCurrency: Currencies.EUR,
    preferredLanguage: Language.EN,
    dateFormat: DateFormat.DD_MM_YYYY,
    country: 'italy',
    timezone: Timezone.EUROPE_ROME,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
}

export function normalizeToIUser(user: any): IUser {
    if (!user) {
        throw new Error('User data is null or undefined')
    }

    if (user.createdAt) {
        user.createdAt = new Date(user.createdAt).toISOString()
    }

    if (user.updatedAt) {
        user.updatedAt = new Date(user.updatedAt).toISOString()
    }

    if (user.onBoardingAt) {
        user.onBoardingAt = new Date(user.onBoardingAt).toISOString()
    }

    return user as IUser
}
