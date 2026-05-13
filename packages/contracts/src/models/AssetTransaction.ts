/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetTransactionTypeEnum } from './AssetTransactionTypeEnum'
import type { CurrencyEnum } from './CurrencyEnum'
export type AssetTransaction = {
    id: string
    assetId: string
    type: AssetTransactionTypeEnum
    date: string
    settlementDate: string
    quantityChange: number
    unitPrice: number
    totalAmount: number
    currency: CurrencyEnum
    fxRate: number | null
    fees: number | null
    taxAmount: number | null
    financialAccountId: string | null
    note: string | null
    createdAt: string
    updatedAt: string
    deletedAt: string | null
}
