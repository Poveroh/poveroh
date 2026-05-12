import { z } from '../zod'
import { AssetConditionEnum, VehicleTypeEnum } from './enum.schema'

/**
 * Vehicle asset schema representing vehicles tracked as assets
 */
export const VehicleAssetSchema = z
    .object({
        id: z.string().uuid(),
        assetId: z.string().uuid(),
        brand: z.string(),
        model: z.string(),
        type: VehicleTypeEnum,
        year: z.number().int().nullable(),
        purchasePrice: z.number().nullable(),
        purchaseDate: z.string().datetime().nullable(),
        plateNumber: z.string().nullable(),
        vin: z.string().nullable(),
        mileage: z.number().int().nullable(),
        condition: AssetConditionEnum.nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().nullable()
    })
    .openapi('VehicleAsset')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for vehicle asset details
 */
export const CreateVehicleAssetSchema = z
    .object({
        brand: z.string().trim().min(1),
        model: z.string().trim().min(1),
        type: VehicleTypeEnum,
        year: z.number().int().nullable(),
        purchasePrice: z.number().nullable(),
        purchaseDate: z.string().nullable(),
        plateNumber: z.string().trim().min(1).nullable(),
        vin: z.string().trim().min(1).nullable(),
        mileage: z.number().int().nullable(),
        condition: AssetConditionEnum.nullable()
    })
    .openapi('CreateVehicleAsset')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating vehicle asset details
 */
export const VehicleAssetFormSchema = CreateVehicleAssetSchema.openapi('VehicleAssetForm')
