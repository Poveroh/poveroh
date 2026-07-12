import { toIsoString } from '@/utils'
import prisma, { Prisma } from '@poveroh/prisma'
import type {
    AssetTypeEnum,
    CreateMarketableAssetRequest,
    MarketableAssetClassEnum,
    MarketableAssetData,
    UpdateMarketableAssetRequest
} from '@poveroh/types'
import { Currency, type MarketableAssetClass } from '@prisma/client'

const marketableSelect = {
    symbol: true,
    isin: true,
    exchange: true,
    assetClass: true,
    sector: true,
    region: true,
    lastPriceSync: true
} satisfies Prisma.MarketableAssetSelect

type MarketableRow = Prisma.MarketableAssetGetPayload<{ select: typeof marketableSelect }>

/**
 * Normalizes a Prisma marketable asset row into the API DTO by converting Date values into ISO strings.
 * @param row The Prisma marketable asset row to convert.
 * @returns The normalized marketable asset data.
 */
function toData(row: MarketableRow): MarketableAssetData {
    return {
        symbol: row.symbol,
        isin: row.isin,
        exchange: row.exchange,
        assetClass: (row.assetClass ?? null) as MarketableAssetClassEnum,
        sector: row.sector,
        region: row.region,
        lastPriceSync: toIsoString(row.lastPriceSync)
    }
}

export class MarketableAssetRepository {
    /**
     * Creates the parent Asset, its MarketableAsset metadata and the opening AssetTransaction in a single transaction so the position is consistent from the start.
     * @param userId The ID of the user who owns the new asset.
     * @param assetId The unique identifier for the new parent asset.
     * @param payload The data required to create the marketable asset and its opening transaction.
     * @returns A promise that resolves to the parent asset id, used by the service to fetch a hydrated AssetData.
     */
    async create(userId: string, assetId: string, payload: CreateMarketableAssetRequest): Promise<string> {
        const totalAmount = payload.quantity * payload.unitPrice
        const date = new Date(payload.date)

        await prisma.$transaction(async tx => {
            await tx.asset.create({
                data: {
                    id: assetId,
                    userId,
                    title: payload.symbol,
                    type: payload.assetClass as AssetTypeEnum,
                    currency: payload.currency,
                    currentValue: totalAmount,
                    currentValueAsOf: date,
                    quantity: payload.quantity,
                    totalInvested: totalAmount + (payload.fees ?? 0)
                }
            })

            await tx.marketableAsset.create({
                data: {
                    assetId,
                    symbol: payload.symbol,
                    assetClass: (payload.assetClass ?? null) as MarketableAssetClass | null
                }
            })

            await tx.assetTransaction.create({
                data: {
                    assetId,
                    type: payload.transactionType,
                    date,
                    quantityChange: payload.quantity,
                    unitPrice: payload.unitPrice,
                    totalAmount,
                    fees: payload.fees,
                    currency: payload.currency
                }
            })
        })

        return assetId
    }

    /**
     * Updates the marketable metadata (symbol, assetClass) and parent asset currency without touching transaction history, ensuring the asset belongs to the specified user.
     * @param userId The ID of the user who owns the parent asset.
     * @param assetId The unique identifier of the parent asset being updated.
     * @param payload The fields used to update the marketable asset.
     */
    async update(userId: string, assetId: string, payload: UpdateMarketableAssetRequest): Promise<void> {
        await prisma.$transaction(async tx => {
            if (payload.currency !== undefined) {
                await tx.asset.update({
                    where: { id: assetId, userId, deletedAt: null },
                    data: { currency: payload.currency as Currency }
                })
            }

            const marketableData: Prisma.MarketableAssetUpdateInput = {
                ...(payload.symbol !== undefined && { symbol: payload.symbol }),
                ...(payload.assetClass !== undefined && {
                    assetClass: payload.assetClass as MarketableAssetClass | null
                })
            }

            if (Object.keys(marketableData).length === 0) return

            await tx.marketableAsset.update({
                where: { assetId },
                data: marketableData
            })
        })
    }

    /**
     * Finds the marketable metadata for the parent asset belonging to the specified user, returning null when the asset does not exist or is not a marketable asset.
     * @param userId The ID of the user who owns the parent asset.
     * @param assetId The unique identifier of the parent asset being inspected.
     * @returns A promise that resolves to the marketable asset metadata, or null when the asset has none.
     */
    async findByAssetId(userId: string, assetId: string): Promise<MarketableAssetData | null> {
        const row = await prisma.marketableAsset.findFirst({
            where: { assetId, deletedAt: null, asset: { userId, deletedAt: null } },
            select: marketableSelect
        })

        return row ? toData(row) : null
    }

    /**
     * Verifies that a marketable asset exists for the given parent asset and is owned by the specified user.
     * @param userId The ID of the user expected to own the parent asset.
     * @param assetId The unique identifier of the parent asset being verified.
     * @returns A promise that resolves to true when the marketable asset exists, or false otherwise.
     */
    async exists(userId: string, assetId: string): Promise<boolean> {
        return Boolean(
            await prisma.marketableAsset.findFirst({
                where: { assetId, deletedAt: null, asset: { userId, deletedAt: null } },
                select: { id: true }
            })
        )
    }

    /**
     * Updates the current price stored on the parent Asset and stamps lastPriceSync on the MarketableAsset metadata, ensuring the asset belongs to the specified user.
     * @param userId The ID of the user who owns the parent asset.
     * @param assetId The unique identifier of the parent asset whose price is being synced.
     * @param price The new current price for the parent asset.
     * @param currency An optional currency override applied alongside the new price.
     * @returns A promise that resolves to true when a matching marketable asset was found and updated, or false otherwise.
     */
    async syncCurrentPrice(userId: string, assetId: string, price: number, currency?: string): Promise<boolean> {
        const exists = await this.exists(userId, assetId)
        if (!exists) return false

        const now = new Date()

        await prisma.$transaction([
            prisma.asset.update({
                where: { id: assetId, userId, deletedAt: null },
                data: {
                    currentValue: price,
                    currentValueAsOf: now,
                    ...(currency && { currency: currency as Currency })
                }
            }),
            prisma.marketableAsset.update({
                where: { assetId },
                data: { lastPriceSync: now }
            })
        ])

        return true
    }
}
