/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetTypeEnum } from './AssetTypeEnum'
import type { CreateCollectibleAssetDetails } from './CreateCollectibleAssetDetails'
import type { CreateInsuranceAsset } from './CreateInsuranceAsset'
import type { CreateMarketableAsset } from './CreateMarketableAsset'
import type { CreatePrivateDealAsset } from './CreatePrivateDealAsset'
import type { CreateRealEstateAsset } from './CreateRealEstateAsset'
import type { CreateVehicleAsset } from './CreateVehicleAsset'
import type { CurrencyEnum } from './CurrencyEnum'
export type UpdateAssetRequest = {
    title?: string
    currency?: CurrencyEnum
    currentValue?: number | null
    currentValueAsOf?: string | null
    type?: AssetTypeEnum
    marketable?: CreateMarketableAsset
    realEstate?: CreateRealEstateAsset
    collectible?: CreateCollectibleAssetDetails
    privateDeal?: CreatePrivateDealAsset
    vehicle?: CreateVehicleAsset
    insurance?: CreateInsuranceAsset
}
