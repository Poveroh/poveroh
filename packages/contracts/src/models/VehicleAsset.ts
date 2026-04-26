/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetConditionEnum } from './AssetConditionEnum'
import type { VehicleTypeEnum } from './VehicleTypeEnum'
export type VehicleAsset = {
    id: string
    assetId: string
    brand: string
    model: string
    type: VehicleTypeEnum
    year: number | null
    purchasePrice: number | null
    purchaseDate: string | null
    plateNumber: string | null
    vin: string | null
    mileage: number | null
    condition: AssetConditionEnum
    createdAt: string
    updatedAt: string
    deletedAt: string | null
}
