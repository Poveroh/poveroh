/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CyclePeriodEnum } from './CyclePeriodEnum'
import type { InsurancePolicyTypeEnum } from './InsurancePolicyTypeEnum'
export type InsuranceAssetData = {
    insurer: string
    policyType: InsurancePolicyTypeEnum
    policyNumber: string
    startDate: string | null
    endDate: string | null
    beneficiary: string
    premiumPaid: number
    premiumFrequency: CyclePeriodEnum
    surrenderValue: number
}
