import { Currencies } from './currency.js'
import { Language } from './language.js'
import { DateFormat } from './date-format.js'
import { Timezone } from './timezone.js'

// User enums - used throughout the application
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

// User-related types for forms and authentication
export interface IUserLogin {
    email: string
    password: string
}

export interface IPasswordToChange {
    oldPassword: string
    newPassword: string
}

export interface IPassword extends IPasswordToChange {
    confirmPassword: string
}

// Default user for initialization
export const defaultUser = {
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
