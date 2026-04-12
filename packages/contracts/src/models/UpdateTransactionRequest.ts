/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExpensesAmount } from './ExpensesAmount'
import type { TransactionActionEnum } from './TransactionActionEnum'
export type UpdateTransactionRequest = {
    title?: string
    date?: string
    categoryId?: string | null
    subcategoryId?: string | null
    note?: string | null
    ignore?: boolean
    action?: TransactionActionEnum
    amounts?: Array<ExpensesAmount>
}
