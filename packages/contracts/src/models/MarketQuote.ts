/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetTypeEnum } from './AssetTypeEnum'
import type { CurrencyEnum } from './CurrencyEnum'
import type { MarketStateEnum } from './MarketStateEnum'
import type { ValueSourceEnum } from './ValueSourceEnum'
export type MarketQuote = {
    providerId: string
    symbol: string
    assetType: AssetTypeEnum
    currency: CurrencyEnum
    price: number
    changePercent: number | null
    marketState: MarketStateEnum
    asOf: string
    valueSource: ValueSourceEnum
    displayName: string | null
    exchange: string | null
    market: string | null
}
