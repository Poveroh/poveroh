/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CountriesEnum } from './CountriesEnum'
import type { CurrencyEnum } from './CurrencyEnum'
import type { DateFormatEnum } from './DateFormatEnum'
import type { LanguageEnum } from './LanguageEnum'
import type { TimezoneEnum } from './TimezoneEnum'
export type UpdateUser = {
    name?: string
    surname?: string
    email?: string
    country?: CountriesEnum
    preferredCurrency?: CurrencyEnum
    preferredLanguage?: LanguageEnum
    dateFormat?: DateFormatEnum
    timezone?: TimezoneEnum
}
