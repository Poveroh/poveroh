/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CyclePeriodEnum } from './CyclePeriodEnum'
import type { DepreciationBaseEnum } from './DepreciationBaseEnum'
import type { DepreciationValueTypeEnum } from './DepreciationValueTypeEnum'
export type AutoDepreciationData = {
    startDate: string
    endDate: string | null
    depreciationBase: DepreciationBaseEnum
    depreciationType: DepreciationValueTypeEnum
    depreciationValue: number
    cyclePeriod: CyclePeriodEnum
    cycleNumber: number
}
