/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AutoDepreciationInput } from './AutoDepreciationInput'
import type { VehicleTypeEnum } from './VehicleTypeEnum'
export type CreateVehicleAssetRequest = {
    brand: string
    model: string
    type: VehicleTypeEnum
    value: number
    purchaseDate?: string
    year?: number
    plateNumber?: string
    logoIcon?: string
    autoDepreciation?: AutoDepreciationInput
}
