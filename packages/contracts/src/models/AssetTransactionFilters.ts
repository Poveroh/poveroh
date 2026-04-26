/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetTransactionParamsId } from './AssetTransactionParamsId'
import type { AssetTransactionTypeEnum } from './AssetTransactionTypeEnum'
import type { DateFilter } from './DateFilter'
import type { StringFilter } from './StringFilter'
export type AssetTransactionFilters = {
    id?: AssetTransactionParamsId
    assetId?: string
    type?: AssetTransactionTypeEnum
    date?: DateFilter
    financialAccountId?: string
    note?: StringFilter
}
