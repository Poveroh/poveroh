/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CountriesEnum } from './CountriesEnum'
import type { CurrencyEnum } from './CurrencyEnum'
import type { DateFormatEnum } from './DateFormatEnum'
import type { LanguageEnum } from './LanguageEnum'
import type { SnapshotFrequencyEnum } from './SnapshotFrequencyEnum'
import type { TimezoneEnum } from './TimezoneEnum'
export type UserPreferences = {
    snapshotFrequency: SnapshotFrequencyEnum
    preferredCurrency: CurrencyEnum
    preferredLanguage: LanguageEnum
    dateFormat: DateFormatEnum
    country: CountriesEnum
    timezone: TimezoneEnum
    preferredMarketDataProviderId: string | null
    marketDataFallbackEnabled: boolean
}
