import { CurrencyEnum } from '../contracts/index'
import { Item } from './item'

export const CurrencyCatalog: Item<CurrencyEnum>[] = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'GBP', value: 'GBP' },
    { label: 'JPY', value: 'JPY' },
    { label: 'CNY', value: 'CNY' },
    { label: 'INR', value: 'INR' },
    { label: 'AUD', value: 'AUD' },
    { label: 'CAD', value: 'CAD' },
    { label: 'CHF', value: 'CHF' },
    { label: 'SEK', value: 'SEK' },
    { label: 'NZD', value: 'NZD' },
    { label: 'MXN', value: 'MXN' },
    { label: 'SGD', value: 'SGD' },
    { label: 'HKD', value: 'HKD' },
    { label: 'NOK', value: 'NOK' },
    { label: 'KRW', value: 'KRW' },
    { label: 'TRY', value: 'TRY' },
    { label: 'UNKNOWN', value: 'UNKNOWN' }
]
