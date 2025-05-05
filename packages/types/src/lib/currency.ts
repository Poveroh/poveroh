import { IItem } from './item.js'

export enum Currencies {
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    JPY = 'JPY',
    CNY = 'CNY',
    INR = 'INR',
    AUD = 'AUD',
    CAD = 'CAD',
    CHF = 'CHF',
    SEK = 'SEK',
    NZD = 'NZD',
    MXN = 'MXN',
    SGD = 'SGD',
    HKD = 'HKD',
    NOK = 'NOK',
    KRW = 'KRW',
    TRY = 'TRY'
}

export const currencyCatalog: IItem[] = Object.values(Currencies).map(currency => ({
    label: currency,
    value: currency
}))
