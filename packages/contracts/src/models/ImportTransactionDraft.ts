/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CurrencyEnum } from './CurrencyEnum'
import type { TransactionActionEnum } from './TransactionActionEnum'
export type ImportTransactionDraft = {
    id: string
    importId: string
    financialAccountId: string
    date: string
    title: string
    action: TransactionActionEnum
    amount: number
    currency: CurrencyEnum
    categoryId: string | null
    subcategoryId: string | null
    subscriptionId: string | null
    icon: string | null
    note: string | null
    bankConnectionId: string | null
    bankSyncAccountId: string | null
    externalTransactionId: string | null
}
