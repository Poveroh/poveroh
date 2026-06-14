import { toNumber, toIsoString } from '@/utils'
import prisma, { Prisma } from '@poveroh/prisma'
import type { CreateRealEstateAssetRequest, RealEstateAssetData, UpdateRealEstateAssetRequest } from '@poveroh/types'
import { RealEstateType } from '@prisma/client'

const realEstateSelect = {
    address: true,
    type: true,
    purchasePrice: true,
    purchaseDate: true
} satisfies Prisma.RealEstateAssetSelect

type RealEstateRow = Prisma.RealEstateAssetGetPayload<{ select: typeof realEstateSelect }>

/**
 * Normalizes a Prisma real estate asset row into the API DTO by converting Decimal and Date values into JSON-friendly types.
 * @param row The Prisma real estate asset row to convert.
 * @returns The normalized real estate asset data.
 */
function toData(row: RealEstateRow): RealEstateAssetData {
    return {
        address: row.address,
        type: row.type,
        purchasePrice: toNumber(row.purchasePrice) ?? 0,
        purchaseDate: toIsoString(row.purchaseDate)
    }
}

export class RealEstateAssetRepository {
    /**
     * Creates the parent Asset and its RealEstateAsset metadata in a single transaction so the property is consistent from the start.
     * The entered value seeds both the parent asset current value and the property purchase price, since the form exposes a single value.
     * @param userId The ID of the user who owns the new asset.
     * @param assetId The unique identifier for the new parent asset.
     * @param payload The data required to create the real estate asset and its parent asset record.
     * @returns A promise that resolves to the parent asset id, used by the service to fetch a hydrated AssetData.
     */
    async create(userId: string, assetId: string, payload: CreateRealEstateAssetRequest): Promise<string> {
        const purchaseDate = payload.purchaseDate ? new Date(payload.purchaseDate) : null

        await prisma.$transaction(async tx => {
            await tx.asset.create({
                data: {
                    id: assetId,
                    userId,
                    title: payload.title,
                    type: 'REAL_ESTATE',
                    currentValue: payload.value,
                    currentValueAsOf: purchaseDate ?? new Date(),
                    quantity: 1,
                    totalInvested: payload.value
                }
            })

            await tx.realEstateAsset.create({
                data: {
                    assetId,
                    address: payload.address ?? '',
                    type: payload.type as RealEstateType,
                    purchasePrice: payload.value,
                    purchaseDate
                }
            })
        })

        return assetId
    }

    /**
     * Updates the real estate metadata and the parent asset value without touching unrelated fields, ensuring the asset belongs to the specified user.
     * @param userId The ID of the user who owns the parent asset.
     * @param assetId The unique identifier of the parent asset being updated.
     * @param payload The fields used to update the real estate asset.
     */
    async update(userId: string, assetId: string, payload: UpdateRealEstateAssetRequest): Promise<void> {
        await prisma.$transaction(async tx => {
            const assetData: Prisma.AssetUpdateInput = {
                ...(payload.title !== undefined && { title: payload.title }),
                ...(payload.value !== undefined && { currentValue: payload.value, totalInvested: payload.value })
            }

            if (Object.keys(assetData).length > 0) {
                await tx.asset.update({
                    where: { id: assetId, userId, deletedAt: null },
                    data: assetData
                })
            }

            const realEstateData: Prisma.RealEstateAssetUpdateInput = {
                ...(payload.address !== undefined && { address: payload.address }),
                ...(payload.type !== undefined && { type: payload.type as RealEstateType }),
                ...(payload.value !== undefined && { purchasePrice: payload.value }),
                ...(payload.purchaseDate !== undefined && {
                    purchaseDate: payload.purchaseDate ? new Date(payload.purchaseDate) : null
                })
            }

            if (Object.keys(realEstateData).length === 0) return

            await tx.realEstateAsset.update({
                where: { assetId },
                data: realEstateData
            })
        })
    }

    /**
     * Finds the real estate metadata for the parent asset belonging to the specified user, returning null when the asset does not exist or is not a real estate asset.
     * @param userId The ID of the user who owns the parent asset.
     * @param assetId The unique identifier of the parent asset being inspected.
     * @returns A promise that resolves to the real estate asset metadata, or null when the asset has none.
     */
    async findByAssetId(userId: string, assetId: string): Promise<RealEstateAssetData | null> {
        const row = await prisma.realEstateAsset.findFirst({
            where: { assetId, deletedAt: null, asset: { userId, deletedAt: null } },
            select: realEstateSelect
        })

        return row ? toData(row) : null
    }

    /**
     * Verifies that a real estate asset exists for the given parent asset and is owned by the specified user.
     * @param userId The ID of the user expected to own the parent asset.
     * @param assetId The unique identifier of the parent asset being verified.
     * @returns A promise that resolves to true when the real estate asset exists, or false otherwise.
     */
    async exists(userId: string, assetId: string): Promise<boolean> {
        return Boolean(
            await prisma.realEstateAsset.findFirst({
                where: { assetId, deletedAt: null, asset: { userId, deletedAt: null } },
                select: { id: true }
            })
        )
    }
}
