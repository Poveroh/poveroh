import { z } from '../zod'
import { CyclePeriodEnum, InsurancePolicyTypeEnum } from './enum.schema'
import { SuccessResponseSchema } from './response.schema'

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
        startDate: z.string().nullable(),
        endDate: z.string().nullable(),
        beneficiary: z.string(),
        premiumPaid: z.number(),
        premiumFrequency: CyclePeriodEnum,
        surrenderValue: z.number(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable()
    })
    .openapi('InsuranceAsset')

/**
 * Insurance asset data schema representing the metadata fields that can be updated independently from the asset record
 */
export const InsuranceAssetDataSchema = InsuranceAssetSchema.omit({
    id: true,
    assetId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('InsuranceAssetData')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for insurance asset details
 */
export const CreateInsuranceAssetRequestSchema = z
    .object({
        insurer: z.string().trim().min(1),
        policyType: InsurancePolicyTypeEnum,
        policyNumber: z.string().trim().min(1),
        startDate: z.string(),
        endDate: z.string(),
        beneficiary: z.string().trim().min(1),
        premiumPaid: z.number().positive(),
        premiumFrequency: CyclePeriodEnum,
        surrenderValue: z.number().min(0)
    })
    .openapi('CreateInsuranceAssetRequest')

/**
 * Response schema for creating a new insurance asset
 */
export const CreateInsuranceAssetResponseSchema = SuccessResponseSchema(InsuranceAssetDataSchema).openapi(
    'CreateInsuranceAssetResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating insurance asset details
 */
export const UpdateInsuranceAssetRequestSchema = z
    .object({
        insurer: z.string().trim().min(1),
        policyType: InsurancePolicyTypeEnum,
        policyNumber: z.string().trim().min(1),
        startDate: z.string(),
        endDate: z.string(),
        beneficiary: z.string().trim().min(1),
        premiumPaid: z.number().positive(),
        premiumFrequency: CyclePeriodEnum,
        surrenderValue: z.number().min(0)
    })
    .partial()
    .openapi('UpdateInsuranceAssetRequest')

/**
 * Response schema for updating insurance asset details
 */
export const UpdateInsuranceAssetResponseSchema = SuccessResponseSchema(InsuranceAssetDataSchema).openapi(
    'UpdateInsuranceAssetResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Form schema for insurance asset
 */
export const InsuranceAssetFormSchema = CreateInsuranceAssetRequestSchema.openapi('InsuranceAssetForm')
