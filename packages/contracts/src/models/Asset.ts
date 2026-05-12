/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetTransaction } from './AssetTransaction'
import type { AssetTypeEnum } from './AssetTypeEnum'
import type { CollectibleAsset } from './CollectibleAsset'
import type { CurrencyEnum } from './CurrencyEnum'
import type { InsuranceAsset } from './InsuranceAsset'
import type { MarketableAsset } from './MarketableAsset'
import type { PrivateDealAsset } from './PrivateDealAsset'
import type { RealEstateAsset } from './RealEstateAsset'
import type { VehicleAsset } from './VehicleAsset'
export type Asset = {
    id: string
    userId: string
    title: string
    type: AssetTypeEnum
    currency: CurrencyEnum
    currentValue: number | null
    currentValueAsOf: string | null
    createdAt: string
    updatedAt: string
    deletedAt: string | null
    marketable?: MarketableAsset
    realEstate?: RealEstateAsset
    collectible?: CollectibleAsset
    privateDeal?: PrivateDealAsset
    vehicle?: VehicleAsset
    insurance?: InsuranceAsset
    transactions: Array<AssetTransaction>
}
