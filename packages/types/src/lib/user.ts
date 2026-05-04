import {
    User,
    SnapshotFrequencyEnum,
    CurrencyEnum,
    LanguageEnum,
    TimezoneEnum,
    DateFormatEnum,
    OnBoardingStepEnum,
    CountriesEnum
} from './contracts.js'

export const DEFAULT_USER: User = {
    id: '',
    name: '',
    surname: '',
    email: '',
    image: null,
    emailVerified: false,
    onBoardingStep: 'EMAIL' as OnBoardingStepEnum,
    onBoardingAt: null,
    snapshotFrequency: 'MONTHLY' as SnapshotFrequencyEnum,
    preferredCurrency: 'EUR' as CurrencyEnum,
    preferredLanguage: 'EN' as LanguageEnum,
    dateFormat: 'DD_MM_YYYY' as DateFormatEnum,
    country: 'ITALY' as CountriesEnum,
    timezone: 'EUROPE_ROME' as TimezoneEnum,
    preferredMarketDataProviderId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
}
