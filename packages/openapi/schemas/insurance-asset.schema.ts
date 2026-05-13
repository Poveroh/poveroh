import { z } from '../zod'
import { CyclePeriodEnum, InsurancePolicyTypeEnum } from './enum.schema'

/**
 * Insurance asset schema representing insurance products with value
 */
export const InsuranceAssetSchema = z
    .object({
        id: z.uuid(),
        assetId: z.uuid(),
        insurer: z.string(),
        policyType: InsurancePolicyTypeEnum,
        policyNumber: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        beneficiary: z.string(),
        premiumPaid: z.number(),
        premiumFrequency: CyclePeriodEnum,
        surrenderValue: z.number(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable()
    })
    .openapi('InsuranceAsset')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for insurance asset details
 */
export const CreateInsuranceAssetSchema = InsuranceAssetSchema.omit({
    id: true,
    assetId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('CreateInsuranceAsset')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating insurance asset details
 */
export const InsuranceAssetFormSchema = CreateInsuranceAssetSchema.openapi('InsuranceAssetForm')
