import { z } from '../zod'
import { AutoDepreciationInputSchema } from './auto-depreciation.schema'
import { AssetConditionEnum, VehicleTypeEnum } from './enum.schema'
import { MultipartRequestSchema } from './media.schema'

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
        logoIcon: z.string().nullable(),
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
 * Request schema for creating a vehicle asset together with its parent asset record.
 * `value` feeds both the parent asset current value and the vehicle purchase price, while the
 * optional `autoDepreciation` sets up a recurring percentage depreciation for the vehicle.
 */
export const CreateVehicleAssetRequestSchema = z
    .object({
        brand: z.string().trim().min(1),
        model: z.string().trim().min(1),
        type: VehicleTypeEnum,
        value: z.number().positive(),
        purchaseDate: z.string().optional(),
        year: z.number().int().positive().optional(),
        plateNumber: z.string().trim().optional(),
        logoIcon: z.string().optional(),
        autoDepreciation: AutoDepreciationInputSchema.optional()
    })
    .openapi('CreateVehicleAssetRequest')

/**
 * Request schema for creating a vehicle asset with an optional logo upload via multipart/form-data
 */
export const CreateVehicleAssetMultipartRequestSchema = MultipartRequestSchema(CreateVehicleAssetRequestSchema).openapi(
    'CreateVehicleAssetMultipartRequest'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating vehicle asset details
 */
export const UpdateVehicleAssetRequestSchema =
    CreateVehicleAssetRequestSchema.partial().openapi('UpdateVehicleAssetRequest')

/**
 * Request schema for updating a vehicle asset with an optional logo upload via multipart/form-data
 */
export const UpdateVehicleAssetMultipartRequestSchema = MultipartRequestSchema(UpdateVehicleAssetRequestSchema).openapi(
    'UpdateVehicleAssetMultipartRequest'
)

/**
 * Form schema for the vehicle asset dialog, aliasing the create request shape
 */
export const VehicleAssetFormSchema = CreateVehicleAssetRequestSchema.openapi('VehicleAssetForm')
