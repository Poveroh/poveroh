import { Currencies } from './currency.js'
import { Language } from './language.js'
import { DateFormat } from './date-format.js'

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

export interface IUser extends IUserBase {
    id: string
    onBoardingStep: OnBoardingStep
    onBoardingAt?: string | null
    image?: string | null
    emailVerified: boolean
    snapshotFrequency: SnapshotFrequency
    preferredCurrency: Currencies
    preferredLanguage: Language
    dateFormat: DateFormat
    country: string
    timezone: string
    createdAt: Date
    updatedAt: Date
}

export interface ISession {
    id: string
    token: string
    userId: string
    expiresAt: Date
    ipAddress?: string | null
    userAgent?: string | null
    createdAt: Date
    updatedAt: Date
}

export interface IAccount {
    id: string
    accountId: string
    providerId: string
    userId: string
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: Date | null
    refreshTokenExpiresAt?: Date | null
    scope?: string | null
    password?: string | null
    createdAt: Date
    updatedAt: Date
}

export interface IVerification {
    id: string
    identifier: string
    value: string
    expiresAt: Date
    userId?: string | null
    createdAt: Date
    updatedAt: Date
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
    timezone: 'UTC',
    createdAt: new Date(),
    updatedAt: new Date()
}
