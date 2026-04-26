/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetParamsId } from './AssetParamsId'
import type { AssetTypeEnum } from './AssetTypeEnum'
import type { CurrencyEnum } from './CurrencyEnum'
import type { DateFilter } from './DateFilter'
import type { StringFilter } from './StringFilter'
export type AssetFilters = {
    id?: AssetParamsId
    title?: StringFilter
    type?: AssetTypeEnum
    symbol?: StringFilter
    currency?: CurrencyEnum
    currentValueAsOf?: DateFilter
}
