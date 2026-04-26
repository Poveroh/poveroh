/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetTypeEnum } from './AssetTypeEnum'
import type { CurrencyEnum } from './CurrencyEnum'
export type MarketInstrument = {
    providerId: string
    providerInstrumentId: string
    symbol: string
    displayName: string
    assetType: AssetTypeEnum
    currency: CurrencyEnum
    exchange: string | null
    market: string | null
    metadata?: Record<string, string>
}
