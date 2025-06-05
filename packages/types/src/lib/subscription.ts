import { Currencies } from './currency.js'

export interface ISubscriptionBase {
    title: string
    description: string
    amount: number
    currency: Currencies
    logo?: string
    icon?: string
    first_payment: string
    cycle_number: string
    cycle_period: CyclePeriod
    remember_period: RememberPeriod
    bank_account_id: string
    is_enabled: boolean
}

export interface ISubscription extends ISubscriptionBase {
    id: string
    user_id: string
    created_at: string
}

export enum CyclePeriod {
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    YEAR = 'YEAR'
}

export enum RememberPeriod {
    SAME_DAY = 'SAME_DAY',
    THREE_DAYS = 'THREE_DAYS',
    SEVEN_DAYS = 'SEVEN_DAYS',
    FOURTEEN_DAYS = 'FOURTEEN_DAYS',
    THIRTY_DAYS = 'THIRTY_DAYS',
    NINETY_DAYS = 'NINETY_DAYS'
}
