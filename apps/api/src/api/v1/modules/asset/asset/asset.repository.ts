import prisma, { Prisma } from '@poveroh/prisma'
import type {
    AssetData,
    AssetFilters,
    AssetTypeEnum,
    CollectibleAsset,
    CurrencyEnum,
    InsuranceAsset,
    MarketableAsset,
    MarketableAssetClassEnum,
    OtherAsset,
    PrivateDealAsset,
    RealEstateAsset,
    VehicleAsset
} from '@poveroh/types'
import { autoDepreciationSelect, toAutoDepreciationData } from '../auto-depreciation/auto-depreciation.repository'
import { toIsoString, toNumber } from '@/v1/helpers/asset.helper'

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

const assetTransactionSelect = {
    id: true,
    assetId: true,
    type: true,
    date: true,
    settlementDate: true,
    quantityChange: true,
    unitPrice: true,
    totalAmount: true,
    currency: true,
    fxRate: true,
    fees: true,
    taxAmount: true,
    financialAccountId: true,
    note: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.AssetTransactionSelect

const assetSelect = {
    id: true,
    title: true,
    type: true,
    currency: true,
    currentValue: true,
    currentValueAsOf: true,
    quantity: true,
    totalInvested: true,
    createdAt: true,
    updatedAt: true,
    marketable: true,
    realEstate: true,
    collectible: true,
    privateDeal: true,
    vehicle: true,
    insurance: true,
    other: true,
    transactions: {
        where: { deletedAt: null },
        orderBy: { date: 'desc' as const },
        select: assetTransactionSelect
    },
    autoDepreciations: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' as const },
        select: autoDepreciationSelect
    }
} satisfies Prisma.AssetSelect

type AssetRow = Prisma.AssetGetPayload<{ select: typeof assetSelect }>
type AssetTransactionRow = Prisma.AssetTransactionGetPayload<{ select: typeof assetTransactionSelect }>

function toAssetTransactionData(row: AssetTransactionRow) {
    return {
        id: row.id,
        assetId: row.assetId,
        type: row.type,
        date: toIsoString(row.date) as string,
        settlementDate: toIsoString(row.settlementDate),
        quantityChange: toNumber(row.quantityChange),
        unitPrice: toNumber(row.unitPrice),
        totalAmount: toNumber(row.totalAmount),
        currency: row.currency as CurrencyEnum,
        fxRate: toNumber(row.fxRate),
        fees: toNumber(row.fees),
        taxAmount: toNumber(row.taxAmount),
        financialAccountId: row.financialAccountId,
        note: row.note,
        createdAt: toIsoString(row.createdAt) as string,
        updatedAt: toIsoString(row.updatedAt) as string
    }
}

function toMarketable(row: NonNullable<AssetRow['marketable']>): MarketableAsset {
    return {
        id: row.id,
        assetId: row.assetId,
        symbol: row.symbol,
        isin: row.isin,
        exchange: row.exchange,
        assetClass: (row.assetClass ?? null) as MarketableAssetClassEnum,
        sector: row.sector,
        region: row.region,
        lastPriceSync: toIsoString(row.lastPriceSync),
        createdAt: toIsoString(row.createdAt) as string,
        updatedAt: toIsoString(row.updatedAt) as string,
        deletedAt: toIsoString(row.deletedAt)
    }
}

function toRealEstate(row: NonNullable<AssetRow['realEstate']>): RealEstateAsset {
    return {
        id: row.id,
        assetId: row.assetId,
        address: row.address,
        type: row.type,
        purchasePrice: toNumber(row.purchasePrice) ?? 0,
        purchaseDate: toIsoString(row.purchaseDate),
        createdAt: toIsoString(row.createdAt) as string,
        updatedAt: toIsoString(row.updatedAt) as string,
        deletedAt: toIsoString(row.deletedAt)
    }
}

function toCollectible(row: NonNullable<AssetRow['collectible']>): CollectibleAsset {
    return {
        id: row.id,
        assetId: row.assetId,
        acquisitionCost: toNumber(row.acquisitionCost),
        acquisitionDate: toIsoString(row.acquisitionDate),
        appraisalValue: toNumber(row.appraisalValue),
        appraisalDate: toIsoString(row.appraisalDate),
        createdAt: toIsoString(row.createdAt) as string,
        updatedAt: toIsoString(row.updatedAt) as string,
        deletedAt: toIsoString(row.deletedAt)
    }
}

function toPrivateDeal(row: NonNullable<AssetRow['privateDeal']>): PrivateDealAsset {
    return {
        id: row.id,
        assetId: row.assetId,
        committedAmount: toNumber(row.committedAmount),
        calledAmount: toNumber(row.calledAmount),
        latestNav: toNumber(row.latestNav),
        navDate: toIsoString(row.navDate),
        createdAt: toIsoString(row.createdAt) as string,
        updatedAt: toIsoString(row.updatedAt) as string,
        deletedAt: toIsoString(row.deletedAt)
    }
}

function toVehicle(row: NonNullable<AssetRow['vehicle']>): VehicleAsset {
    return {
        id: row.id,
        assetId: row.assetId,
        brand: row.brand,
        model: row.model,
        type: row.type,
        year: row.year,
        purchasePrice: toNumber(row.purchasePrice) ?? 0,
        purchaseDate: toIsoString(row.purchaseDate),
        plateNumber: row.plateNumber,
        vin: row.vin,
        mileage: row.mileage,
        condition: row.condition,
        logoIcon: row.logoIcon,
        createdAt: toIsoString(row.createdAt) as string,
        updatedAt: toIsoString(row.updatedAt) as string,
        deletedAt: toIsoString(row.deletedAt)
    }
}

function toOther(row: NonNullable<AssetRow['other']>): OtherAsset {
    return {
        id: row.id,
        assetId: row.assetId,
        description: row.description,
        purchasePrice: toNumber(row.purchasePrice),
        purchaseDate: toIsoString(row.purchaseDate),
        createdAt: toIsoString(row.createdAt) as string,
        updatedAt: toIsoString(row.updatedAt) as string,
        deletedAt: toIsoString(row.deletedAt)
    }
}

function toInsurance(row: NonNullable<AssetRow['insurance']>): InsuranceAsset {
    return {
        id: row.id,
        assetId: row.assetId,
        insurer: row.insurer,
        policyType: row.policyType,
        policyNumber: row.policyNumber,
        startDate: toIsoString(row.startDate),
        endDate: toIsoString(row.endDate),
        beneficiary: row.beneficiary,
        premiumPaid: toNumber(row.premiumPaid) ?? 0,
        premiumFrequency: row.premiumFrequency,
        surrenderValue: toNumber(row.surrenderValue) ?? 0,
        createdAt: toIsoString(row.createdAt) as string,
        updatedAt: toIsoString(row.updatedAt) as string,
        deletedAt: toIsoString(row.deletedAt)
    }
}

/**
 * Normalizes a Prisma asset row with relations into the API DTO by converting Decimal and Date values into plain JSON-friendly types.
 * @param row The Prisma asset row to convert.
 * @returns The normalized asset data.
 */
function toData(row: AssetRow): AssetData {
    return {
        id: row.id,
        title: row.title,
        type: row.type,
        currency: row.currency as CurrencyEnum,
        currentValue: toNumber(row.currentValue) ?? 0,
        currentValueAsOf: toIsoString(row.currentValueAsOf) as string,
        quantity: toNumber(row.quantity) ?? 0,
        totalInvested: toNumber(row.totalInvested) ?? 0,
        createdAt: toIsoString(row.createdAt) as string,
        updatedAt: toIsoString(row.updatedAt) as string,
        marketable: row.marketable ? toMarketable(row.marketable) : undefined,
        realEstate: row.realEstate ? toRealEstate(row.realEstate) : undefined,
        collectible: row.collectible ? toCollectible(row.collectible) : undefined,
        privateDeal: row.privateDeal ? toPrivateDeal(row.privateDeal) : undefined,
        vehicle: row.vehicle ? toVehicle(row.vehicle) : undefined,
        insurance: row.insurance ? toInsurance(row.insurance) : undefined,
        other: row.other ? toOther(row.other) : undefined,
        transactions: row.transactions.map(toAssetTransactionData),
        autoDepreciations: row.autoDepreciations.map(toAutoDepreciationData)
    }
}

export class AssetRepository {
    /**
     * Finds an asset by its user-scoped ID, including all subtype relations and active transactions.
     * @param userId The ID of the user who owns the asset.
     * @param id The unique identifier of the asset being retrieved.
     * @returns A promise that resolves to the asset data, or null when no matching row is found.
     */
    async findById(userId: string, id: string): Promise<AssetData | null> {
        const row = await prisma.asset.findFirst({
            where: { id, userId, deletedAt: null },
            select: assetSelect
        })

        return row ? toData(row) : null
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
        const rows = await prisma.asset.findMany({
            where: this.buildListWhere(userId, filters),
            select: assetSelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })

        return rows.map(toData)
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
            await softDeleteSubtypes(tx, id, deletedAt)
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
                await softDeleteSubtypes(tx, asset.id, deletedAt)
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
}

/**
 * Soft deletes every subtype row attached to the asset within an existing transaction, so the parent asset can be removed without leaving dangling subtype data.
 * @param tx The Prisma client used to run the soft-delete updates.
 * @param assetId The unique identifier of the parent asset whose subtypes are being deleted.
 * @param deletedAt The timestamp indicating when the deletions occurred.
 */
async function softDeleteSubtypes(tx: Prisma.TransactionClient, assetId: string, deletedAt: Date): Promise<void> {
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
