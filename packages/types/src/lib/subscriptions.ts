import { CreateSubscriptionRequest } from './contracts.js'

export const DEFAULT_SUBSCRIPTION: CreateSubscriptionRequest = {
    title: '',
    description: '',
    amount: 0,
    isEnabled: true,
    currency: 'EUR',
    appearanceMode: 'ICON',
    appearanceLogoIcon: 'coffee',
    firstPayment: new Date().toISOString().split('T')[0]!,
    cycleNumber: 1,
    cyclePeriod: 'MONTH',
    rememberPeriod: 'THREE_DAYS',
    financialAccountId: ''
}
