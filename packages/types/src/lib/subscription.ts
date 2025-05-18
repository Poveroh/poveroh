import { Currencies } from './currency.js'

export interface ISubscriptionBase {
    title: string
    description: string
    amount: number
    currency: Currencies
    logo?: string
    icon?: string
    first_payment: string
    cycle_number: number
    cycle_period: CyclePeriod
    remember_number: number
    remember_period: CyclePeriod
    expires_date: string
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
