import { z } from '../zod'
import { CyclePeriodEnum, DepreciationBaseEnum, DepreciationValueTypeEnum } from './enum.schema'

/**
 * Auto depreciation schema representing a recurring rule that lowers an asset value over time
 */
export const AutoDepreciationSchema = z
    .object({
        id: z.uuid(),
        assetId: z.uuid(),
        startDate: z.string(),
        endDate: z.string().nullable(),
        depreciationBase: DepreciationBaseEnum,
        depreciationType: DepreciationValueTypeEnum,
        depreciationValue: z.number(),
        cyclePeriod: CyclePeriodEnum,
        cycleNumber: z.number().int(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable()
    })
    .openapi('AutoDepreciation')

/**
 * Auto depreciation data schema representing the depreciation fields returned alongside an asset
 */
export const AutoDepreciationDataSchema = AutoDepreciationSchema.omit({
    id: true,
    assetId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('AutoDepreciationData')

/**
 * Auto depreciation input schema embedded in asset creation/update forms.
 * The percentage feeds a PERCENTAGE depreciation step applied every cycleNumber cyclePeriod.
 */
export const AutoDepreciationInputSchema = z
    .object({
        percentage: z.number().positive(),
        cyclePeriod: CyclePeriodEnum,
        cycleNumber: z.number().int().positive()
    })
    .openapi('AutoDepreciationInput')
