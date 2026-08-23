/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CurrencyEnum } from './CurrencyEnum'
export type CreateBankSyncAccountRequest = {
    connectionId: string
    financialAccountId: string
    externalAccountId: string
    externalAccountName: string | null
    currency: CurrencyEnum
}
