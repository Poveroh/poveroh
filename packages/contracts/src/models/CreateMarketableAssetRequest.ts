/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetMarketDataTypeEnum } from './AssetMarketDataTypeEnum'
import type { CurrencyEnum } from './CurrencyEnum'
import type { MarketableAssetClassEnum } from './MarketableAssetClassEnum'
export type CreateMarketableAssetRequest = {
    transactionType: AssetMarketDataTypeEnum
    assetClass?: MarketableAssetClassEnum
    financialAccountId: string
    symbol: string
    providerId: string
    providerInstrumentId: string
    date: string
    quantity: number
    unitPrice: number
    fees: number
    currency: CurrencyEnum
}
