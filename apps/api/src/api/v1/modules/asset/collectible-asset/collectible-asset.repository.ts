import prisma, { Prisma } from '@poveroh/prisma'
import type { CollectibleAssetData, CreateCollectibleAssetRequest, UpdateCollectibleAssetRequest } from '@poveroh/types'
import { collectibleSelect } from '@/types/select'

export class CollectibleAssetRepository {
    /**
     * Creates the parent Asset and its CollectibleAsset metadata in a single transaction so the valuable is consistent from the start.
     * The entered value seeds both the parent asset current value and the collectible acquisition cost, since the form exposes a single value.
     * @param userId The ID of the user who owns the new asset.
     * @param assetId The unique identifier for the new parent asset.
     * @param payload The data required to create the collectible asset and its parent asset record.
     * @returns A promise that resolves to the parent asset id, used by the service to fetch a hydrated AssetData.
     */
    async create(userId: string, assetId: string, payload: CreateCollectibleAssetRequest): Promise<string> {
        const acquisitionDate = payload.acquisitionDate ? new Date(payload.acquisitionDate) : null
        const appraisalDate = payload.appraisalDate ? new Date(payload.appraisalDate) : null

        await prisma.$transaction(async tx => {
            await tx.asset.create({
                data: {
                    id: assetId,
                    userId,
                    title: payload.title,
                    type: 'COLLECTIBLE',
                    currentValue: payload.value,
                    currentValueAsOf: appraisalDate ?? acquisitionDate ?? new Date(),
                    quantity: 1,
                    totalInvested: payload.value
                }
            })

            await tx.collectibleAsset.create({
                data: {
                    assetId,
                    acquisitionCost: payload.value,
                    acquisitionDate,
                    appraisalValue: payload.appraisalValue ?? null,
                    appraisalDate
                }
            })
        })

        return assetId
    }

    /**
     * Updates the collectible metadata and the parent asset value without touching unrelated fields, ensuring the asset belongs to the specified user.
     * @param userId The ID of the user who owns the parent asset.
     * @param assetId The unique identifier of the parent asset being updated.
     * @param payload The fields used to update the collectible asset.
     */
    async update(userId: string, assetId: string, payload: UpdateCollectibleAssetRequest): Promise<void> {
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

            const collectibleData: Prisma.CollectibleAssetUpdateInput = {
                ...(payload.value !== undefined && { acquisitionCost: payload.value }),
                ...(payload.acquisitionDate !== undefined && {
                    acquisitionDate: payload.acquisitionDate ? new Date(payload.acquisitionDate) : null
                }),
                ...(payload.appraisalValue !== undefined && { appraisalValue: payload.appraisalValue }),
                ...(payload.appraisalDate !== undefined && {
                    appraisalDate: payload.appraisalDate ? new Date(payload.appraisalDate) : null
                })
            }

            if (Object.keys(collectibleData).length === 0) return

            await tx.collectibleAsset.update({
                where: { assetId },
                data: collectibleData
            })
        })
    }

    /**
     * Finds the collectible metadata for the parent asset belonging to the specified user, returning null when the asset does not exist or is not a collectible asset.
     * @param userId The ID of the user who owns the parent asset.
     * @param assetId The unique identifier of the parent asset being inspected.
     * @returns A promise that resolves to the collectible asset metadata, or null when the asset has none.
     */
    async findByAssetId(userId: string, assetId: string): Promise<CollectibleAssetData | null> {
        return (await prisma.collectibleAsset.findFirst({
            where: { assetId, deletedAt: null, asset: { userId, deletedAt: null } },
            select: collectibleSelect
        })) as unknown as CollectibleAssetData | null
    }

    /**
     * Verifies that a collectible asset exists for the given parent asset and is owned by the specified user.
     * @param userId The ID of the user expected to own the parent asset.
     * @param assetId The unique identifier of the parent asset being verified.
     * @returns A promise that resolves to true when the collectible asset exists, or false otherwise.
     */
    async exists(userId: string, assetId: string): Promise<boolean> {
        return Boolean(
            await prisma.collectibleAsset.findFirst({
                where: { assetId, deletedAt: null, asset: { userId, deletedAt: null } },
                select: { id: true }
            })
        )
    }
}
