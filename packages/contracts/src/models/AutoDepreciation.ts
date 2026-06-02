/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CyclePeriodEnum } from './CyclePeriodEnum'
import type { DepreciationBaseEnum } from './DepreciationBaseEnum'
import type { DepreciationValueTypeEnum } from './DepreciationValueTypeEnum'
export type AutoDepreciation = {
    id: string
    assetId: string
    startDate: string
    endDate: string | null
    depreciationBase: DepreciationBaseEnum
    depreciationType: DepreciationValueTypeEnum
    depreciationValue: number
    cyclePeriod: CyclePeriodEnum
    cycleNumber: number
    createdAt: string
    updatedAt: string
    deletedAt: string | null
}
