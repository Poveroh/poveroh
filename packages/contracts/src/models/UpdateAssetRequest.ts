/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetTypeEnum } from './AssetTypeEnum'
import type { CreateCollectibleAssetDetails } from './CreateCollectibleAssetDetails'
import type { CreateInsuranceAssetDetails } from './CreateInsuranceAssetDetails'
import type { CreateMarketableAssetDetails } from './CreateMarketableAssetDetails'
import type { CreatePrivateDealAssetDetails } from './CreatePrivateDealAssetDetails'
import type { CreateRealEstateAssetDetails } from './CreateRealEstateAssetDetails'
import type { CreateVehicleAssetDetails } from './CreateVehicleAssetDetails'
import type { CurrencyEnum } from './CurrencyEnum'
export type UpdateAssetRequest = {
    title?: string
    type?: AssetTypeEnum
    currency?: CurrencyEnum
    currentValue?: number | null
    currentValueAsOf?: string | null
    marketable?: CreateMarketableAssetDetails
    realEstate?: CreateRealEstateAssetDetails
    collectible?: CreateCollectibleAssetDetails
    privateDeal?: CreatePrivateDealAssetDetails
    vehicle?: CreateVehicleAssetDetails
    insurance?: CreateInsuranceAssetDetails
}
