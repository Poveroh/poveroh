/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RealEstateTypeEnum } from './RealEstateTypeEnum'
export type CreateRealEstateAssetRequest = {
    title: string
    type: RealEstateTypeEnum
    value: number
    purchaseDate?: string
    address?: string
}
