/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetTypeEnum } from './AssetTypeEnum'
import type { MarketDataTransportEnum } from './MarketDataTransportEnum'
export type MarketDataProvider = {
    id: string
    label: string
    transport: MarketDataTransportEnum
    enabled: boolean
    supportsSearch: boolean
    supportsQuotes: boolean
    supportsStreaming: boolean
    supportedAssetTypes: Array<AssetTypeEnum>
}
