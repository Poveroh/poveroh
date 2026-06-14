import { toIsoString, toNumber } from '@/utils'
import prisma, { Prisma } from '@poveroh/prisma'
import type { CreateOtherAssetRequest, OtherAssetData, UpdateOtherAssetRequest } from '@poveroh/types'

const otherSelect = {
    description: true,
    purchasePrice: true,
    purchaseDate: true
} satisfies Prisma.OtherAssetSelect

type OtherRow = Prisma.OtherAssetGetPayload<{ select: typeof otherSelect }>

/**
 * Normalizes a Prisma other asset row into the API DTO by converting Decimal and Date values into JSON-friendly types.
 * @param row The Prisma other asset row to convert.
 * @returns The normalized other asset data.
 */
function toData(row: OtherRow): OtherAssetData {
    return {
        description: row.description,
        purchasePrice: toNumber(row.purchasePrice),
        purchaseDate: toIsoString(row.purchaseDate)
    }
}

export class OtherAssetRepository {
    /**
     * Creates the parent Asset and its OtherAsset metadata in a single transaction so the asset is consistent from the start.
     * The entered value seeds both the parent asset current value and the purchase price, since the form exposes a single value.
     * @param userId The ID of the user who owns the new asset.
     * @param assetId The unique identifier for the new parent asset.
     * @param payload The data required to create the other asset and its parent asset record.
     * @returns A promise that resolves to the parent asset id, used by the service to fetch a hydrated AssetData.
     */
    async create(userId: string, assetId: string, payload: CreateOtherAssetRequest): Promise<string> {
        const purchaseDate = payload.purchaseDate ? new Date(payload.purchaseDate) : null

        await prisma.$transaction(async tx => {
            await tx.asset.create({
                data: {
                    id: assetId,
                    userId,
                    title: payload.title,
                    type: 'OTHER',
                    currentValue: payload.value,
                    currentValueAsOf: purchaseDate ?? new Date(),
                    quantity: 1,
                    totalInvested: payload.value
                }
            })

            await tx.otherAsset.create({
                data: {
                    assetId,
                    description: payload.description ?? null,
                    purchasePrice: payload.value,
                    purchaseDate
                }
            })
        })

        return assetId
    }

    /**
     * Updates the other asset metadata and the parent asset value without touching unrelated fields, ensuring the asset belongs to the specified user.
     * @param userId The ID of the user who owns the parent asset.
     * @param assetId The unique identifier of the parent asset being updated.
     * @param payload The fields used to update the other asset.
     */
    async update(userId: string, assetId: string, payload: UpdateOtherAssetRequest): Promise<void> {
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

            const otherData: Prisma.OtherAssetUpdateInput = {
                ...(payload.description !== undefined && { description: payload.description }),
                ...(payload.value !== undefined && { purchasePrice: payload.value }),
                ...(payload.purchaseDate !== undefined && {
                    purchaseDate: payload.purchaseDate ? new Date(payload.purchaseDate) : null
                })
            }

            if (Object.keys(otherData).length === 0) return

            await tx.otherAsset.update({
                where: { assetId },
                data: otherData
            })
        })
    }

    /**
     * Finds the other asset metadata for the parent asset belonging to the specified user, returning null when the asset does not exist or is not an other asset.
     * @param userId The ID of the user who owns the parent asset.
     * @param assetId The unique identifier of the parent asset being inspected.
     * @returns A promise that resolves to the other asset metadata, or null when the asset has none.
     */
    async findByAssetId(userId: string, assetId: string): Promise<OtherAssetData | null> {
        const row = await prisma.otherAsset.findFirst({
            where: { assetId, deletedAt: null, asset: { userId, deletedAt: null } },
            select: otherSelect
        })

        return row ? toData(row) : null
    }

    /**
     * Verifies that an other asset exists for the given parent asset and is owned by the specified user.
     * @param userId The ID of the user expected to own the parent asset.
     * @param assetId The unique identifier of the parent asset being verified.
     * @returns A promise that resolves to true when the other asset exists, or false otherwise.
     */
    async exists(userId: string, assetId: string): Promise<boolean> {
        return Boolean(
            await prisma.otherAsset.findFirst({
                where: { assetId, deletedAt: null, asset: { userId, deletedAt: null } },
                select: { id: true }
            })
        )
    }
}
