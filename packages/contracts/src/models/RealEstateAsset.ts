/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RealEstateTypeEnum } from './RealEstateTypeEnum'
export type RealEstateAsset = {
    id: string
    assetId: string
    address: string
    type: RealEstateTypeEnum
    purchasePrice: number
    purchaseDate: string
    createdAt: string
    updatedAt: string
    deletedAt: string | null
}
