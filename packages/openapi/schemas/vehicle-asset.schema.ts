import { z } from '../zod'
import { AssetConditionEnum, VehicleTypeEnum } from './enum.schema'
import { SuccessResponseSchema } from './response.schema'

/**
 * Vehicle asset schema representing vehicles tracked as assets
 */
export const VehicleAssetSchema = z
    .object({
        id: z.uuid(),
        assetId: z.uuid(),
        brand: z.string(),
        model: z.string(),
        type: VehicleTypeEnum,
        year: z.number().int(),
        purchasePrice: z.number(),
        purchaseDate: z.string().nullable(),
        plateNumber: z.string(),
        vin: z.string().nullable(),
        mileage: z.number().int().nullable(),
        condition: AssetConditionEnum.nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable()
    })
    .openapi('VehicleAsset')

/**
 * Vehicle asset data schema representing the metadata fields that can be updated independently from the asset record
 */
export const VehicleAssetDataSchema = VehicleAssetSchema.omit({
    id: true,
    assetId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('VehicleAssetData')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for vehicle asset details
 */
export const CreateVehicleAssetRequestSchema = z
    .object({
        brand: z.string().trim().min(1),
        model: z.string().trim().min(1),
        type: VehicleTypeEnum,
        year: z.number().int(),
        purchasePrice: z.number().positive(),
        purchaseDate: z.string(),
        plateNumber: z.string().trim().min(1),
        vin: z.string().trim().min(1).nullable(),
        mileage: z.number().int().nullable(),
        condition: AssetConditionEnum.nullable()
    })
    .openapi('CreateVehicleAssetRequest')

/**
 * Response schema for creating a new vehicle asset
 */
export const CreateVehicleAssetResponseSchema = SuccessResponseSchema(VehicleAssetDataSchema).openapi(
    'CreateVehicleAssetResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating vehicle asset details
 */
export const UpdateVehicleAssetRequestSchema = z
    .object({
        brand: z.string().trim().min(1),
        model: z.string().trim().min(1),
        type: VehicleTypeEnum,
        year: z.number().int(),
        purchasePrice: z.number().positive(),
        purchaseDate: z.string(),
        plateNumber: z.string().trim().min(1),
        vin: z.string().trim().min(1).nullable(),
        mileage: z.number().int().nullable(),
        condition: AssetConditionEnum.nullable()
    })
    .partial()
    .openapi('UpdateVehicleAssetRequest')

/**
 * Response schema for updating vehicle asset details
 */
export const UpdateVehicleAssetResponseSchema = SuccessResponseSchema(VehicleAssetDataSchema).openapi(
    'UpdateVehicleAssetResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Form schema for vehicle asset
 */
export const VehicleAssetFormSchema = CreateVehicleAssetRequestSchema.openapi('VehicleAssetForm')
