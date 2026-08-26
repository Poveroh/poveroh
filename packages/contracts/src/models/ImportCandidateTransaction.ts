/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CurrencyEnum } from './CurrencyEnum'
import type { TransactionActionEnum } from './TransactionActionEnum'
export type ImportCandidateTransaction = {
    date: string
    title: string
    amount: number
    currency: CurrencyEnum
    action: TransactionActionEnum
    externalTransactionId?: string | null
    bankSyncAccountId?: string | null
    rawRow?: Array<string>
}
