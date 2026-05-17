/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MarketableAssetClassEnum } from './MarketableAssetClassEnum'
export type MarketableAssetData = {
    symbol: string
    isin: string | null
    exchange: string | null
    assetClass: MarketableAssetClassEnum
    sector: string | null
    region: string | null
    lastPriceSync: string | null
}
