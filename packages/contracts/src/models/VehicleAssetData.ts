/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetConditionEnum } from './AssetConditionEnum'
import type { VehicleTypeEnum } from './VehicleTypeEnum'
export type VehicleAssetData = {
    brand: string
    model: string
    type: VehicleTypeEnum
    year: number
    purchasePrice: number
    purchaseDate: string | null
    plateNumber: string
    vin: string | null
    mileage: number | null
    condition: AssetConditionEnum
}
