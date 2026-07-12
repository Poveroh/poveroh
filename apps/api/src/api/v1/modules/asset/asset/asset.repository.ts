import prisma, { Prisma } from '@poveroh/prisma'
import type { AssetData, AssetFilters, AssetTypeEnum } from '@poveroh/types'
import { toNumber } from '@/utils'
import { assetSelect } from '@/types/select'

export type PortfolioSummary = {
    totalAssets: number
    totalCurrentValue: number
    totalWithLiveMarketData: number
    byType: Array<{
        type: AssetTypeEnum
        count: number
        totalCurrentValue: number
    }>
}

export class AssetRepository {
    /**
     * Finds an asset by its user-scoped ID, including all subtype relations and active transactions.
     * @param userId The ID of the user who owns the asset.
     * @param id The unique identifier of the asset being retrieved.
     * @returns A promise that resolves to the asset data, or null when no matching row is found.
     */
    async findById(userId: string, id: string): Promise<AssetData | null> {
        return (await prisma.asset.findFirst({
            where: { id, userId, deletedAt: null },
            select: assetSelect
        })) as unknown as AssetData | null
    }

    /**
     * Finds assets matching the supplied filters and pagination, scoped to the specified user and excluding soft-deleted rows.
     * @param userId The ID of the user who owns the assets.
     * @param filters The filters to apply when retrieving assets.
     * @param skip The number of records to skip for pagination.
     * @param take The number of records to take for pagination.
     * @returns A promise that resolves to the matching assets.
     */
    async findMany(userId: string, filters: AssetFilters, skip: number, take: number): Promise<AssetData[]> {
        return (await prisma.asset.findMany({
            where: this.buildListWhere(userId, filters),
            select: assetSelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })) as unknown as AssetData[]
    }

    /**
     * Builds the Prisma where clause for listing assets, combining ownership and soft-delete constraints with the supplied filters.
     * @param userId The ID of the user who owns the assets.
     * @param filters The filters to apply when retrieving assets.
     * @returns The composed Prisma where clause.
     */
    buildListWhere(userId: string, filters: AssetFilters): Prisma.AssetWhereInput {
        return {
            userId,
            deletedAt: null,
            ...(filters.id?.id && { id: filters.id.id }),
            ...(filters.type && { type: filters.type }),
            ...(filters.currency && { currency: filters.currency }),
            ...(filters.title && {
                title: {
                    ...(filters.title.equals && { equals: filters.title.equals }),
                    ...(filters.title.contains && { contains: filters.title.contains, mode: 'insensitive' })
                }
            }),
            ...(filters.symbol && {
                marketable: {
                    is: {
                        ...(filters.symbol.equals && { symbol: { equals: filters.symbol.equals } }),
                        ...(filters.symbol.contains && {
                            symbol: { contains: filters.symbol.contains, mode: 'insensitive' }
                        })
                    }
                }
            }),
            ...(filters.currentValueAsOf && {
                currentValueAsOf: {
                    ...(filters.currentValueAsOf.gte && { gte: new Date(filters.currentValueAsOf.gte) }),
                    ...(filters.currentValueAsOf.lte && { lte: new Date(filters.currentValueAsOf.lte) })
                }
            })
        }
    }

    /**
     * Soft deletes an asset and its subtype rows in a single transaction, ensuring the asset belongs to the specified user.
     * @param userId The ID of the user who owns the asset.
     * @param id The unique identifier of the asset being deleted.
     * @param deletedAt The timestamp indicating when the deletion occurred.
     * @returns A promise that resolves to true when a matching asset was soft-deleted, or false when no matching asset existed.
     */
    async softDelete(userId: string, id: string, deletedAt: Date): Promise<boolean> {
        const existing = await prisma.asset.findFirst({
            where: { id, userId, deletedAt: null },
            select: { id: true }
        })

        if (!existing) return false

        await prisma.$transaction(async tx => {
            await tx.asset.update({ where: { id }, data: { deletedAt } })
            await this.softDeleteSubtypes(tx, id, deletedAt)
        })

        return true
    }

    /**
     * Soft deletes every asset owned by the specified user along with their subtype rows.
     * @param userId The ID of the user whose assets are being deleted.
     * @param deletedAt The timestamp indicating when the deletions occurred.
     */
    async softDeleteAll(userId: string, deletedAt: Date): Promise<void> {
        const assets = await prisma.asset.findMany({
            where: { userId, deletedAt: null },
            select: { id: true }
        })

        if (assets.length === 0) return

        await prisma.$transaction(async tx => {
            await tx.asset.updateMany({
                where: { userId, deletedAt: null },
                data: { deletedAt }
            })

            for (const asset of assets) {
                await this.softDeleteSubtypes(tx, asset.id, deletedAt)
            }
        })
    }

    /**
     * Aggregates the user's assets into a portfolio summary by counting totals and grouping current value by asset type.
     * @param userId The ID of the user whose portfolio is being summarized.
     * @returns A promise that resolves to the portfolio summary, sorted by total current value descending.
     */
    async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
        const assets = await prisma.asset.findMany({
            where: { userId, deletedAt: null },
            select: {
                type: true,
                currentValue: true,
                currentValueAsOf: true
            }
        })

        const byTypeMap = new Map<AssetTypeEnum, PortfolioSummary['byType'][number]>()
        let totalCurrentValue = 0
        let totalWithLiveMarketData = 0

        for (const asset of assets) {
            const currentValue = toNumber(asset.currentValue) ?? 0
            totalCurrentValue += currentValue

            if (asset.currentValueAsOf) {
                totalWithLiveMarketData += 1
            }

            const existing = byTypeMap.get(asset.type) ?? {
                type: asset.type,
                count: 0,
                totalCurrentValue: 0
            }

            existing.count += 1
            existing.totalCurrentValue += currentValue
            byTypeMap.set(asset.type, existing)
        }

        return {
            totalAssets: assets.length,
            totalCurrentValue,
            totalWithLiveMarketData,
            byType: Array.from(byTypeMap.values()).sort(
                (left, right) => right.totalCurrentValue - left.totalCurrentValue
            )
        }
    }

    /**
     * Soft deletes every subtype row attached to the asset within an existing transaction, so the parent asset can be removed without leaving dangling subtype data.
     * @param tx The Prisma client used to run the soft-delete updates.
     * @param assetId The unique identifier of the parent asset whose subtypes are being deleted.
     * @param deletedAt The timestamp indicating when the deletions occurred.
     */
    async softDeleteSubtypes(tx: Prisma.TransactionClient, assetId: string, deletedAt: Date): Promise<void> {
        await Promise.all([
            tx.marketableAsset.updateMany({ where: { assetId, deletedAt: null }, data: { deletedAt } }),
            tx.realEstateAsset.updateMany({ where: { assetId, deletedAt: null }, data: { deletedAt } }),
            tx.collectibleAsset.updateMany({ where: { assetId, deletedAt: null }, data: { deletedAt } }),
            tx.privateDealAsset.updateMany({ where: { assetId, deletedAt: null }, data: { deletedAt } }),
            tx.vehicleAsset.updateMany({ where: { assetId, deletedAt: null }, data: { deletedAt } }),
            tx.insuranceAsset.updateMany({ where: { assetId, deletedAt: null }, data: { deletedAt } }),
            tx.otherAsset.updateMany({ where: { assetId, deletedAt: null }, data: { deletedAt } })
        ])
    }
}
