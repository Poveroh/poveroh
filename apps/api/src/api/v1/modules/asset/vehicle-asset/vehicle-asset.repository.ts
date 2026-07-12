import prisma, { Prisma } from '@poveroh/prisma'
import type { CreateVehicleAssetRequest, UpdateVehicleAssetRequest, VehicleAssetData } from '@poveroh/types'
import { VehicleType } from '@prisma/client'
import { AutoDepreciationRepository } from '../auto-depreciation/auto-depreciation.repository'

const vehicleSelect = {
    brand: true,
    model: true,
    type: true,
    year: true,
    purchasePrice: true,
    purchaseDate: true,
    plateNumber: true,
    vin: true,
    mileage: true,
    condition: true,
    logoIcon: true
} satisfies Prisma.VehicleAssetSelect

/**
 * Composes a human-friendly asset title from the vehicle brand and model.
 * @param brand The vehicle brand.
 * @param model The vehicle model.
 * @returns The combined, trimmed title.
 */
function buildTitle(brand: string, model: string): string {
    return `${brand} ${model}`.trim()
}

export class VehicleAssetRepository {
    private readonly autoDepreciationRepository = new AutoDepreciationRepository()

    /**
     * Creates the parent Asset, its VehicleAsset metadata and an optional auto depreciation rule in a single transaction so the vehicle is consistent from the start.
     * The entered value seeds both the parent asset current value and the vehicle purchase price, since the form exposes a single value.
     * @param userId The ID of the user who owns the new asset.
     * @param assetId The unique identifier for the new parent asset.
     * @param payload The data required to create the vehicle asset and its parent asset record.
     * @returns A promise that resolves to the parent asset id, used by the service to fetch a hydrated AssetData.
     */
    async create(userId: string, assetId: string, payload: CreateVehicleAssetRequest): Promise<string> {
        const purchaseDate = payload.purchaseDate ? new Date(payload.purchaseDate) : null
        const startDate = purchaseDate ?? new Date()

        await prisma.$transaction(async tx => {
            await tx.asset.create({
                data: {
                    id: assetId,
                    userId,
                    title: buildTitle(payload.brand, payload.model),
                    type: 'VEHICLE',
                    currentValue: payload.value,
                    currentValueAsOf: startDate,
                    quantity: 1,
                    totalInvested: payload.value
                }
            })

            await tx.vehicleAsset.create({
                data: {
                    assetId,
                    brand: payload.brand,
                    model: payload.model,
                    type: payload.type as VehicleType,
                    year: payload.year ?? startDate.getFullYear(),
                    purchasePrice: payload.value,
                    purchaseDate,
                    plateNumber: payload.plateNumber ?? '',
                    logoIcon: payload.logoIcon ?? null
                }
            })

            if (payload.autoDepreciation) {
                await this.autoDepreciationRepository.create(tx, assetId, payload.autoDepreciation, startDate)
            }
        })

        return assetId
    }

    /**
     * Updates the vehicle metadata, the parent asset value and the optional auto depreciation rule, ensuring the asset belongs to the specified user.
     * @param userId The ID of the user who owns the parent asset.
     * @param assetId The unique identifier of the parent asset being updated.
     * @param payload The fields used to update the vehicle asset.
     */
    async update(userId: string, assetId: string, payload: UpdateVehicleAssetRequest): Promise<void> {
        await prisma.$transaction(async tx => {
            const current = await tx.vehicleAsset.findFirst({
                where: { assetId, deletedAt: null, asset: { userId, deletedAt: null } },
                select: { brand: true, model: true }
            })

            const assetData: Prisma.AssetUpdateInput = {
                ...(payload.value !== undefined && { currentValue: payload.value, totalInvested: payload.value })
            }

            if (current && (payload.brand !== undefined || payload.model !== undefined)) {
                assetData.title = buildTitle(payload.brand ?? current.brand, payload.model ?? current.model)
            }

            if (Object.keys(assetData).length > 0) {
                await tx.asset.update({
                    where: { id: assetId, userId, deletedAt: null },
                    data: assetData
                })
            }

            const vehicleData: Prisma.VehicleAssetUpdateInput = {
                ...(payload.brand !== undefined && { brand: payload.brand }),
                ...(payload.model !== undefined && { model: payload.model }),
                ...(payload.type !== undefined && { type: payload.type as VehicleType }),
                ...(payload.year !== undefined && { year: payload.year }),
                ...(payload.value !== undefined && { purchasePrice: payload.value }),
                ...(payload.plateNumber !== undefined && { plateNumber: payload.plateNumber }),
                ...(payload.logoIcon !== undefined && { logoIcon: payload.logoIcon }),
                ...(payload.purchaseDate !== undefined && {
                    purchaseDate: payload.purchaseDate ? new Date(payload.purchaseDate) : null
                })
            }

            if (Object.keys(vehicleData).length > 0) {
                await tx.vehicleAsset.update({ where: { assetId }, data: vehicleData })
            }

            if (payload.autoDepreciation) {
                await this.autoDepreciationRepository.replaceForAsset(tx, assetId, payload.autoDepreciation, new Date())
            }
        })
    }

    /**
     * Finds the vehicle metadata for the parent asset belonging to the specified user, returning null when the asset does not exist or is not a vehicle asset.
     * @param userId The ID of the user who owns the parent asset.
     * @param assetId The unique identifier of the parent asset being inspected.
     * @returns A promise that resolves to the vehicle asset metadata, or null when the asset has none.
     */
    async findByAssetId(userId: string, assetId: string): Promise<VehicleAssetData | null> {
        return (await prisma.vehicleAsset.findFirst({
            where: { assetId, deletedAt: null, asset: { userId, deletedAt: null } },
            select: vehicleSelect
        })) as unknown as VehicleAssetData | null
    }

    /**
     * Verifies that a vehicle asset exists for the given parent asset and is owned by the specified user.
     * @param userId The ID of the user expected to own the parent asset.
     * @param assetId The unique identifier of the parent asset being verified.
     * @returns A promise that resolves to true when the vehicle asset exists, or false otherwise.
     */
    async exists(userId: string, assetId: string): Promise<boolean> {
        return Boolean(
            await prisma.vehicleAsset.findFirst({
                where: { assetId, deletedAt: null, asset: { userId, deletedAt: null } },
                select: { id: true }
            })
        )
    }
}
