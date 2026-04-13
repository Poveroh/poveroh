/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CountriesEnum } from './CountriesEnum'
import type { CurrencyEnum } from './CurrencyEnum'
import type { DateFormatEnum } from './DateFormatEnum'
import type { LanguageEnum } from './LanguageEnum'
import type { OnBoardingStepEnum } from './OnBoardingStepEnum'
import type { SnapshotFrequencyEnum } from './SnapshotFrequencyEnum'
import type { TimezoneEnum } from './TimezoneEnum'
export type UserSchema = {
    id: string
    name: string
    surname: string
    email: string
    emailVerified: boolean
    onBoardingStep: OnBoardingStepEnum
    onBoardingAt: string | null
    image: string | null
    createdAt: string
    updatedAt: string
    snapshotFrequency: SnapshotFrequencyEnum
    preferredCurrency: CurrencyEnum
    preferredLanguage: LanguageEnum
    dateFormat: DateFormatEnum
    country: CountriesEnum
    timezone: TimezoneEnum
}
