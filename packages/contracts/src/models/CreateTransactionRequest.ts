/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CurrencyEnum } from './CurrencyEnum'
import type { TransactionActionEnum } from './TransactionActionEnum'
import type { TransactionAmount } from './TransactionAmount'
export type CreateTransactionRequest = {
    title: string
    categoryId: string | null
    subcategoryId: string | null
    note: string | null
    ignore: boolean
    date: string
    action: TransactionActionEnum
    currency: CurrencyEnum
    amounts: Array<TransactionAmount>
}
