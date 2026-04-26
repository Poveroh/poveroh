/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetByTypeSummary } from './AssetByTypeSummary'
export type PortfolioSummary = {
    totalAssets: number
    totalCurrentValue: number
    totalWithLiveMarketData: number
    byType: Array<AssetByTypeSummary>
}
