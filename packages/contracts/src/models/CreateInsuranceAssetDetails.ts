/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InsurancePolicyTypeEnum } from './InsurancePolicyTypeEnum'
export type CreateInsuranceAssetDetails = {
    insurer: string | null
    policyType: InsurancePolicyTypeEnum
    policyNumber: string | null
    startDate: string | null
    endDate: string | null
    beneficiary: string | null
    premiumPaid: number | null
    premiumFrequency: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | null
    surrenderValue: number | null
}
