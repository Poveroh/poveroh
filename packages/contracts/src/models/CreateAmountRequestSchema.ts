/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CurrencyEnum } from './CurrencyEnum'
import type { TransactionActionEnum } from './TransactionActionEnum'
export type CreateAmountRequestSchema = {
    transactionId: string
    amount: number
    currency: CurrencyEnum
    action: TransactionActionEnum
    financialAccountId: string
    importReferenceId: string | null
}
