import { z } from '../zod'
import { InsurancePolicyTypeEnum } from './enum.schema'

/**
 * Insurance asset schema representing insurance products with value
 */
export const InsuranceAssetSchema = z
    .object({
        id: z.string().uuid(),
        assetId: z.string().uuid(),
        insurer: z.string().nullable(),
        policyType: InsurancePolicyTypeEnum.nullable(),
        policyNumber: z.string().nullable(),
        startDate: z.string().datetime().nullable(),
        endDate: z.string().datetime().nullable(),
        beneficiary: z.string().nullable(),
        premiumPaid: z.number().nullable(),
        premiumFrequency: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR']).nullable(),
        surrenderValue: z.number().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().nullable()
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
