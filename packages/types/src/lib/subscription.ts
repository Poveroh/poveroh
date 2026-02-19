import { Currencies } from './currency.js'
import { AppearanceMode } from './modal.js'

export interface ISubscription {
    id: string
    userId: string
    createdAt: string
    title: string
    description: string
    amount: number
    currency: Currencies
    appearanceMode: AppearanceMode
    appearanceLogoIcon: string
    firstPayment: string
    cycleNumber: string
    cyclePeriod: CyclePeriod
    rememberPeriod: RememberPeriod
    financialAccountId: string
    isEnabled: boolean
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
