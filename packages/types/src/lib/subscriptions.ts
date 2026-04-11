import { CreateSubscriptionRequest } from './contracts.js'

export const DEFAULT_SUBSCRIPTION: CreateSubscriptionRequest = {
    title: '',
    description: '',
    amount: 0,
    isEnabled: true,
    currency: 'EUR',
    appearanceMode: 'ICON',
    appearanceLogoIcon: 'coffee',
    appearanceIconColor: '#818a66',
    firstPayment: new Date().toISOString(),
    cycleNumber: 1,
    cyclePeriod: 'MONTH',
    rememberPeriod: 'THREE_DAYS',
    financialAccountId: ''
}
