/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetTransactionTypeEnum } from './AssetTransactionTypeEnum'
import type { CurrencyEnum } from './CurrencyEnum'
export type UpdateAssetTransactionRequest = {
    assetId?: string
    type?: AssetTransactionTypeEnum
    date?: string
    settlementDate?: string | null
    quantityChange?: number | null
    unitPrice?: number | null
    totalAmount?: number | null
    currency?: CurrencyEnum
    fxRate?: number | null
    fees?: number | null
    taxAmount?: number | null
    financialAccountId?: string | null
    note?: string | null
}
