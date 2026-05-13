/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetConditionEnum } from './AssetConditionEnum'
import type { VehicleTypeEnum } from './VehicleTypeEnum'
export type VehicleAssetForm = {
    brand: string
    model: string
    type: VehicleTypeEnum
    year: number
    purchasePrice: number
    purchaseDate: string
    plateNumber: string
    vin: string | null
    mileage: number | null
    condition: AssetConditionEnum
}
