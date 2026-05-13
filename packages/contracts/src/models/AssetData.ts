/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetTransactionData } from './AssetTransactionData'
import type { AssetTypeEnum } from './AssetTypeEnum'
import type { CollectibleAsset } from './CollectibleAsset'
import type { CurrencyEnum } from './CurrencyEnum'
import type { InsuranceAsset } from './InsuranceAsset'
import type { MarketableAsset } from './MarketableAsset'
import type { PrivateDealAsset } from './PrivateDealAsset'
import type { RealEstateAsset } from './RealEstateAsset'
import type { VehicleAsset } from './VehicleAsset'
export type AssetData = {
    id: string
    title: string
    type: AssetTypeEnum
    currency: CurrencyEnum
    currentValue: number
    currentValueAsOf: string
    quantity: number
    totalInvested: number
    createdAt: string
    updatedAt: string
    marketable?: MarketableAsset
    realEstate?: RealEstateAsset
    collectible?: CollectibleAsset
    privateDeal?: PrivateDealAsset
    vehicle?: VehicleAsset
    insurance?: InsuranceAsset
    transactions: Array<AssetTransactionData>
}
