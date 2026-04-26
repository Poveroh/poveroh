import prisma, { Prisma } from '@poveroh/prisma'
import {
    CreateAssetRequestSchema,
    CreateAssetTransactionRequestSchema,
    UpdateAssetRequestSchema,
    UpdateAssetTransactionRequestSchema
} from '@poveroh/schemas'
import type {
    AssetData,
    AssetFilters,
    AssetTransactionData,
    AssetTransactionFilters,
    CreateAssetRequest,
    CreateAssetTransactionRequest,
    PortfolioSummary,
    UpdateAssetRequest,
    UpdateAssetTransactionRequest
} from '@poveroh/types'
import { BadRequestError, NotFoundError } from '@/src/utils'
import { BaseService } from './base.service'

const assetInclude = {
    marketable: true,
    realEstate: true,
    collectible: true,
    privateDeal: true,
    vehicle: true,
    insurance: true
} satisfies Prisma.AssetInclude

type AssetWithRelations = Prisma.AssetGetPayload<{ include: typeof assetInclude }>

type AssetSubtypeKey = 'marketable' | 'realEstate' | 'collectible' | 'privateDeal' | 'vehicle' | 'insurance'

// Converts nullable Prisma decimals into plain numbers for API responses.
const toNumber = (value: Prisma.Decimal | number | string | null | undefined) => {
    if (value == null) {
        return null
    }

    return Number(value)
}

// Normalizes nullable dates into ISO strings so the contract is stable for the frontend.
const toIsoString = (value: Date | null | undefined) => value?.toISOString() ?? null

// Maps an asset type to the Prisma subtype relation that should contain its extra fields.
const getSubtypeKeyByAssetType = (
    type: CreateAssetRequest['type'] | UpdateAssetRequest['type']
): AssetSubtypeKey | null => {
    switch (type) {
        case 'STOCK':
        case 'BOND':
        case 'ETF':
        case 'MUTUAL_FUND':
        case 'CRYPTOCURRENCY':
            return 'marketable'
        case 'REAL_ESTATE':
            return 'realEstate'
        case 'COLLECTIBLE':
            return 'collectible'
        case 'VEHICLE':
            return 'vehicle'
        case 'PRIVATE_EQUITY':
        case 'VENTURE_CAPITAL':
        case 'PRIVATE_DEBT':
        case 'P2P_LENDING':
            return 'privateDeal'
        case 'INSURANCE_POLICY':
            return 'insurance'
        default:
            return null
    }
}

// Applies business semantics to quantity changes so position metrics stay consistent even if payload quantities are positive.
const normalizeQuantityDelta = (type: AssetTransactionData['type'], quantityChange: number | null) => {
    if (quantityChange == null) {
        return 0
    }

    const absoluteQuantity = Math.abs(quantityChange)
    switch (type) {
        case 'SELL':
        case 'WITHDRAWAL':
        case 'DISTRIBUTION':
            return absoluteQuantity * -1
        default:
            return absoluteQuantity
    }
}

// Builds the summary block used by asset responses and the investments overview.
const buildPositionMap = (transactions: AssetTransactionData[]) => {
    const positions = new Map<string, AssetData['position']>()

    for (const transaction of transactions) {
        const current = positions.get(transaction.assetId) ?? {
            quantity: 0,
            investedAmount: 0,
            proceedsAmount: 0,
            netContribution: 0,
            averageCost: null,
            realizedCashFlow: 0,
            lastTransactionAt: null
        }

        const quantityDelta = normalizeQuantityDelta(transaction.type, transaction.quantityChange)
        const totalAmount = transaction.totalAmount ?? 0
        const fees = transaction.fees ?? 0
        const taxes = transaction.taxAmount ?? 0

        current.quantity = (current.quantity ?? 0) + quantityDelta

        switch (transaction.type) {
            case 'BUY':
            case 'DEPOSIT':
            case 'CAPITAL_CALL':
                current.investedAmount = (current.investedAmount ?? 0) + totalAmount
                current.netContribution = (current.netContribution ?? 0) + totalAmount
                break
            case 'SELL':
            case 'WITHDRAWAL':
            case 'DISTRIBUTION':
                current.proceedsAmount = (current.proceedsAmount ?? 0) + totalAmount
                current.netContribution = (current.netContribution ?? 0) - totalAmount
                break
            case 'DIVIDEND':
            case 'INTEREST':
                current.realizedCashFlow = (current.realizedCashFlow ?? 0) + totalAmount
                break
            default:
                break
        }

        current.realizedCashFlow = (current.realizedCashFlow ?? 0) - fees - taxes
        current.lastTransactionAt =
            !current.lastTransactionAt || current.lastTransactionAt < transaction.date
                ? transaction.date
                : current.lastTransactionAt

        if (current.quantity && current.quantity > 0 && current.investedAmount != null) {
            current.averageCost = current.investedAmount / current.quantity
        } else {
            current.averageCost = null
        }

        positions.set(transaction.assetId, current)
    }

    return positions
}

// Converts an asset row with optional subtype relations into the public API DTO.
const mapAsset = (asset: AssetWithRelations, position: AssetData['position'] | null): AssetData => ({
    id: asset.id,
    title: asset.title,
    type: asset.type,
    currency: asset.currency,
    currentValue: toNumber(asset.currentValue),
    currentValueAsOf: toIsoString(asset.currentValueAsOf),
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
    ...(asset.marketable && {
        marketable: {
            id: asset.marketable.id,
            assetId: asset.marketable.assetId,
            symbol: asset.marketable.symbol ?? null,
            isin: asset.marketable.isin ?? null,
            exchange: asset.marketable.exchange ?? null,
            assetClass: asset.marketable.assetClass ?? null,
            sector: asset.marketable.sector ?? null,
            region: asset.marketable.region ?? null,
            lastPriceSync: toIsoString(asset.marketable.lastPriceSync),
            createdAt: asset.marketable.createdAt.toISOString(),
            updatedAt: asset.marketable.updatedAt.toISOString(),
            deletedAt: toIsoString(asset.marketable.deletedAt)
        }
    }),
    ...(asset.realEstate && {
        realEstate: {
            id: asset.realEstate.id,
            assetId: asset.realEstate.assetId,
            address: asset.realEstate.address ?? null,
            type: asset.realEstate.type,
            purchasePrice: toNumber(asset.realEstate.purchasePrice),
            purchaseDate: toIsoString(asset.realEstate.purchaseDate),
            createdAt: asset.realEstate.createdAt.toISOString(),
            updatedAt: asset.realEstate.updatedAt.toISOString(),
            deletedAt: toIsoString(asset.realEstate.deletedAt)
        }
    }),
    ...(asset.collectible && {
        collectible: {
            id: asset.collectible.id,
            assetId: asset.collectible.assetId,
            acquisitionCost: toNumber(asset.collectible.acquisitionCost),
            acquisitionDate: toIsoString(asset.collectible.acquisitionDate),
            appraisalValue: toNumber(asset.collectible.appraisalValue),
            appraisalDate: toIsoString(asset.collectible.appraisalDate),
            createdAt: asset.collectible.createdAt.toISOString(),
            updatedAt: asset.collectible.updatedAt.toISOString(),
            deletedAt: toIsoString(asset.collectible.deletedAt)
        }
    }),
    ...(asset.privateDeal && {
        privateDeal: {
            id: asset.privateDeal.id,
            assetId: asset.privateDeal.assetId,
            committedAmount: toNumber(asset.privateDeal.committedAmount),
            calledAmount: toNumber(asset.privateDeal.calledAmount),
            latestNav: toNumber(asset.privateDeal.latestNav),
            navDate: toIsoString(asset.privateDeal.navDate),
            createdAt: asset.privateDeal.createdAt.toISOString(),
            updatedAt: asset.privateDeal.updatedAt.toISOString(),
            deletedAt: toIsoString(asset.privateDeal.deletedAt)
        }
    }),
    ...(asset.vehicle && {
        vehicle: {
            id: asset.vehicle.id,
            assetId: asset.vehicle.assetId,
            brand: asset.vehicle.brand,
            model: asset.vehicle.model,
            type: asset.vehicle.type,
            year: asset.vehicle.year ?? null,
            purchasePrice: toNumber(asset.vehicle.purchasePrice),
            purchaseDate: toIsoString(asset.vehicle.purchaseDate),
            plateNumber: asset.vehicle.plateNumber ?? null,
            vin: asset.vehicle.vin ?? null,
            mileage: asset.vehicle.mileage ?? null,
            condition: asset.vehicle.condition ?? null,
            createdAt: asset.vehicle.createdAt.toISOString(),
            updatedAt: asset.vehicle.updatedAt.toISOString(),
            deletedAt: toIsoString(asset.vehicle.deletedAt)
        }
    }),
    ...(asset.insurance && {
        insurance: {
            id: asset.insurance.id,
            assetId: asset.insurance.assetId,
            insurer: asset.insurance.insurer ?? null,
            policyType: asset.insurance.policyType ?? null,
            policyNumber: asset.insurance.policyNumber ?? null,
            startDate: toIsoString(asset.insurance.startDate),
            endDate: toIsoString(asset.insurance.endDate),
            beneficiary: asset.insurance.beneficiary ?? null,
            premiumPaid: toNumber(asset.insurance.premiumPaid),
            premiumFrequency: asset.insurance.premiumFrequency ?? null,
            surrenderValue: toNumber(asset.insurance.surrenderValue),
            createdAt: asset.insurance.createdAt.toISOString(),
            updatedAt: asset.insurance.updatedAt.toISOString(),
            deletedAt: toIsoString(asset.insurance.deletedAt)
        }
    }),
    ...(position && {
        position
    })
})

// Converts an asset transaction row into the public API DTO.
const mapAssetTransaction = (
    transaction: Prisma.AssetTransactionGetPayload<Record<string, never>>
): AssetTransactionData => ({
    id: transaction.id,
    assetId: transaction.assetId,
    type: transaction.type,
    date: transaction.date.toISOString(),
    settlementDate: toIsoString(transaction.settlementDate),
    quantityChange: toNumber(transaction.quantityChange),
    unitPrice: toNumber(transaction.unitPrice),
    totalAmount: toNumber(transaction.totalAmount),
    currency: transaction.currency,
    fxRate: toNumber(transaction.fxRate),
    fees: toNumber(transaction.fees),
    taxAmount: toNumber(transaction.taxAmount),
    financialAccountId: transaction.financialAccountId ?? null,
    note: transaction.note ?? null,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString()
})

export class AssetService extends BaseService {
    constructor(userId: string) {
        super(userId, 'asset')
    }

    // Creates an asset and persists the correct subtype table in the same transaction.
    async createAsset(payload: CreateAssetRequest): Promise<AssetData> {
        const userId = this.getUserId()
        const parsed = CreateAssetRequestSchema.parse(payload) as CreateAssetRequest

        const asset = await prisma.$transaction(async tx => {
            const createdAsset = await tx.asset.create({
                data: {
                    userId,
                    title: parsed.title,
                    type: parsed.type,
                    currency: parsed.currency,
                    currentValue: parsed.currentValue ?? null,
                    currentValueAsOf: parsed.currentValueAsOf ? new Date(parsed.currentValueAsOf) : null
                },
                include: assetInclude
            })

            await this.persistSubtypeDetails(tx, createdAsset.id, parsed.type, parsed, false)

            return tx.asset.findUniqueOrThrow({
                where: { id: createdAsset.id },
                include: assetInclude
            })
        })

        return mapAsset(asset, null)
    }

    // Updates an asset and keeps subtype records aligned when the asset family changes.
    async updateAsset(id: string, payload: UpdateAssetRequest): Promise<void> {
        const userId = this.getUserId()
        const parsed = UpdateAssetRequestSchema.parse(payload) as UpdateAssetRequest

        const existingAsset = await prisma.asset.findFirst({
            where: { id, userId, deletedAt: null },
            select: { id: true, type: true }
        })

        if (!existingAsset) {
            throw new NotFoundError('Asset not found')
        }

        await prisma.$transaction(async tx => {
            await tx.asset.update({
                where: { id },
                data: {
                    ...(parsed.title !== undefined && { title: parsed.title }),
                    ...(parsed.type !== undefined && { type: parsed.type }),
                    ...(parsed.currency !== undefined && { currency: parsed.currency }),
                    ...(parsed.currentValue !== undefined && { currentValue: parsed.currentValue }),
                    ...(parsed.currentValueAsOf !== undefined && {
                        currentValueAsOf: parsed.currentValueAsOf ? new Date(parsed.currentValueAsOf) : null
                    })
                }
            })

            const effectiveType = parsed.type ?? existingAsset.type
            const assetTypeChanged = parsed.type !== undefined && parsed.type !== existingAsset.type

            if (assetTypeChanged) {
                await this.softDeleteSubtypeDetails(tx, id)
            }

            await this.persistSubtypeDetails(tx, id, effectiveType, parsed, true)
        })
    }

    // Soft deletes a single asset and its subtype rows.
    async deleteAsset(id: string): Promise<void> {
        const userId = this.getUserId()
        const deletedAt = new Date()

        const existingAsset = await prisma.asset.findFirst({
            where: { id, userId, deletedAt: null },
            select: { id: true }
        })

        if (!existingAsset) {
            throw new NotFoundError('Asset not found')
        }

        await prisma.$transaction(async tx => {
            await tx.asset.update({
                where: { id },
                data: { deletedAt }
            })
            await this.softDeleteSubtypeDetails(tx, id, deletedAt)
        })
    }

    // Soft deletes all assets and their subtype rows for the authenticated user.
    async deleteAllAssets(): Promise<void> {
        const userId = this.getUserId()
        const deletedAt = new Date()

        const assetIds = await prisma.asset.findMany({
            where: { userId, deletedAt: null },
            select: { id: true }
        })

        if (assetIds.length === 0) {
            return
        }

        await prisma.$transaction(async tx => {
            await tx.asset.updateMany({
                where: { userId, deletedAt: null },
                data: { deletedAt }
            })

            for (const asset of assetIds) {
                await this.softDeleteSubtypeDetails(tx, asset.id, deletedAt)
            }
        })
    }

    // Retrieves a single asset with subtype details and derived position metrics.
    async getAssetById(id: string): Promise<AssetData | null> {
        const userId = this.getUserId()
        const asset = await prisma.asset.findFirst({
            where: { id, userId, deletedAt: null },
            include: assetInclude
        })

        if (!asset) {
            return null
        }

        const transactions = await this.getAssetTransactions({ assetId: id }, 0, 500)
        const positionMap = buildPositionMap(transactions)

        return mapAsset(asset, positionMap.get(asset.id) ?? null)
    }

    // Retrieves a filtered asset list with subtype details and derived position metrics.
    async getAssets(filters: AssetFilters, skip: number, take: number): Promise<AssetData[]> {
        const userId = this.getUserId()
        const where: Prisma.AssetWhereInput = {
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

        const assets = await prisma.asset.findMany({
            where,
            include: assetInclude,
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })

        const assetIds = assets.map(asset => asset.id)
        const transactions = assetIds.length
            ? await this.getAssetTransactions({ assetId: undefined }, 0, 5000, assetIds)
            : []
        const positionMap = buildPositionMap(transactions)

        return assets.map(asset => mapAsset(asset, positionMap.get(asset.id) ?? null))
    }

    // Aggregates the high-level metrics needed by the investments overview screen.
    async getPortfolioSummary(): Promise<PortfolioSummary> {
        const userId = this.getUserId()
        const assets = await prisma.asset.findMany({
            where: { userId, deletedAt: null },
            select: {
                id: true,
                type: true,
                currentValue: true,
                currentValueAsOf: true
            }
        })

        const byTypeMap = new Map<PortfolioSummary['byType'][number]['type'], PortfolioSummary['byType'][number]>()
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

    // Creates a new asset transaction after verifying asset and linked account ownership.
    async createAssetTransaction(payload: CreateAssetTransactionRequest): Promise<AssetTransactionData> {
        const userId = this.getUserId()
        const parsed = CreateAssetTransactionRequestSchema.parse(payload) as CreateAssetTransactionRequest

        await this.ensureAssetOwnership(parsed.assetId, userId)
        await this.ensureFinancialAccountOwnership(parsed.financialAccountId, userId)

        const createdTransaction = await prisma.assetTransaction.create({
            data: {
                assetId: parsed.assetId,
                type: parsed.type,
                date: new Date(parsed.date),
                settlementDate: parsed.settlementDate ? new Date(parsed.settlementDate) : null,
                quantityChange: parsed.quantityChange ?? null,
                unitPrice: parsed.unitPrice ?? null,
                totalAmount: parsed.totalAmount ?? null,
                currency: parsed.currency,
                fxRate: parsed.fxRate ?? null,
                fees: parsed.fees ?? null,
                taxAmount: parsed.taxAmount ?? null,
                financialAccountId: parsed.financialAccountId ?? null,
                note: parsed.note ?? null
            }
        })

        return mapAssetTransaction(createdTransaction)
    }

    // Updates an existing asset transaction and keeps ownership constraints enforced.
    async updateAssetTransaction(id: string, payload: UpdateAssetTransactionRequest): Promise<void> {
        const userId = this.getUserId()
        const parsed = UpdateAssetTransactionRequestSchema.parse(payload) as UpdateAssetTransactionRequest

        const existingTransaction = await prisma.assetTransaction.findFirst({
            where: {
                id,
                deletedAt: null,
                asset: {
                    userId,
                    deletedAt: null
                }
            },
            select: {
                id: true,
                assetId: true
            }
        })

        if (!existingTransaction) {
            throw new NotFoundError('Asset transaction not found')
        }

        const targetAssetId = parsed.assetId ?? existingTransaction.assetId
        await this.ensureAssetOwnership(targetAssetId, userId)
        await this.ensureFinancialAccountOwnership(parsed.financialAccountId, userId)

        await prisma.assetTransaction.update({
            where: { id },
            data: {
                ...(parsed.assetId !== undefined && { assetId: parsed.assetId }),
                ...(parsed.type !== undefined && { type: parsed.type }),
                ...(parsed.date !== undefined && { date: new Date(parsed.date) }),
                ...(parsed.settlementDate !== undefined && {
                    settlementDate: parsed.settlementDate ? new Date(parsed.settlementDate) : null
                }),
                ...(parsed.quantityChange !== undefined && { quantityChange: parsed.quantityChange }),
                ...(parsed.unitPrice !== undefined && { unitPrice: parsed.unitPrice }),
                ...(parsed.totalAmount !== undefined && { totalAmount: parsed.totalAmount }),
                ...(parsed.currency !== undefined && { currency: parsed.currency }),
                ...(parsed.fxRate !== undefined && { fxRate: parsed.fxRate }),
                ...(parsed.fees !== undefined && { fees: parsed.fees }),
                ...(parsed.taxAmount !== undefined && { taxAmount: parsed.taxAmount }),
                ...(parsed.financialAccountId !== undefined && { financialAccountId: parsed.financialAccountId }),
                ...(parsed.note !== undefined && { note: parsed.note })
            }
        })
    }

    // Soft deletes a single asset transaction.
    async deleteAssetTransaction(id: string): Promise<void> {
        const userId = this.getUserId()

        const existingTransaction = await prisma.assetTransaction.findFirst({
            where: {
                id,
                deletedAt: null,
                asset: {
                    userId,
                    deletedAt: null
                }
            },
            select: { id: true }
        })

        if (!existingTransaction) {
            throw new NotFoundError('Asset transaction not found')
        }

        await prisma.assetTransaction.update({
            where: { id },
            data: { deletedAt: new Date() }
        })
    }

    // Soft deletes all asset transactions for the authenticated user.
    async deleteAllAssetTransactions(): Promise<void> {
        const userId = this.getUserId()

        await prisma.assetTransaction.updateMany({
            where: {
                deletedAt: null,
                asset: {
                    userId,
                    deletedAt: null
                }
            },
            data: { deletedAt: new Date() }
        })
    }

    // Retrieves one asset transaction by ID.
    async getAssetTransactionById(id: string): Promise<AssetTransactionData | null> {
        const userId = this.getUserId()
        const transaction = await prisma.assetTransaction.findFirst({
            where: {
                id,
                deletedAt: null,
                asset: {
                    userId,
                    deletedAt: null
                }
            }
        })

        return transaction ? mapAssetTransaction(transaction) : null
    }

    // Retrieves filtered asset transactions and can optionally scope the query to a known asset ID list.
    async getAssetTransactions(
        filters: AssetTransactionFilters,
        skip: number,
        take: number,
        assetIds?: string[]
    ): Promise<AssetTransactionData[]> {
        const userId = this.getUserId()
        const where: Prisma.AssetTransactionWhereInput = {
            deletedAt: null,
            ...(filters.id?.id && { id: filters.id.id }),
            ...(filters.assetId && { assetId: filters.assetId }),
            ...(assetIds && assetIds.length > 0 && { assetId: { in: assetIds } }),
            ...(filters.type && { type: filters.type }),
            ...(filters.financialAccountId && { financialAccountId: filters.financialAccountId }),
            ...(filters.note && {
                note: {
                    ...(filters.note.equals && { equals: filters.note.equals }),
                    ...(filters.note.contains && { contains: filters.note.contains, mode: 'insensitive' })
                }
            }),
            ...(filters.date && {
                date: {
                    ...(filters.date.gte && { gte: new Date(filters.date.gte) }),
                    ...(filters.date.lte && { lte: new Date(filters.date.lte) })
                }
            }),
            asset: {
                userId,
                deletedAt: null
            }
        }

        const transactions = await prisma.assetTransaction.findMany({
            where,
            orderBy: { date: 'desc' },
            skip,
            take
        })

        return transactions.map(mapAssetTransaction)
    }

    // Soft deletes all subtype rows so an asset can safely switch family without stale related data.
    private async softDeleteSubtypeDetails(
        tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
        assetId: string,
        deletedAt: Date = new Date()
    ) {
        await Promise.all([
            tx.marketableAsset.updateMany({ where: { assetId, deletedAt: null }, data: { deletedAt } }),
            tx.realEstateAsset.updateMany({ where: { assetId, deletedAt: null }, data: { deletedAt } }),
            tx.collectibleAsset.updateMany({ where: { assetId, deletedAt: null }, data: { deletedAt } }),
            tx.privateDealAsset.updateMany({ where: { assetId, deletedAt: null }, data: { deletedAt } }),
            tx.vehicleAsset.updateMany({ where: { assetId, deletedAt: null }, data: { deletedAt } }),
            tx.insuranceAsset.updateMany({ where: { assetId, deletedAt: null }, data: { deletedAt } })
        ])
    }

    // Upserts the subtype table that matches the selected asset family.
    private async persistSubtypeDetails(
        tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
        assetId: string,
        type: CreateAssetRequest['type'] | UpdateAssetRequest['type'],
        payload: CreateAssetRequest | UpdateAssetRequest,
        isUpdate: boolean
    ) {
        const subtypeKey = getSubtypeKeyByAssetType(type)

        if (!subtypeKey) {
            return
        }

        const subtypePayload = payload[subtypeKey]
        if (!subtypePayload) {
            if (!isUpdate) {
                throw new BadRequestError(`Missing subtype payload for ${type}`)
            }
            return
        }

        switch (subtypeKey) {
            case 'marketable': {
                const marketablePayload = payload.marketable
                if (!marketablePayload) {
                    return
                }

                await tx.marketableAsset.upsert({
                    where: { assetId },
                    create: { assetId, ...marketablePayload },
                    update: { ...marketablePayload, deletedAt: null }
                })
                return
            }
            case 'realEstate': {
                const realEstatePayload = payload.realEstate
                if (!realEstatePayload) {
                    return
                }

                await tx.realEstateAsset.upsert({
                    where: { assetId },
                    create: {
                        assetId,
                        ...realEstatePayload,
                        purchaseDate: realEstatePayload.purchaseDate ? new Date(realEstatePayload.purchaseDate) : null
                    },
                    update: {
                        ...realEstatePayload,
                        purchaseDate: realEstatePayload.purchaseDate ? new Date(realEstatePayload.purchaseDate) : null,
                        deletedAt: null
                    }
                })
                return
            }
            case 'collectible': {
                const collectiblePayload = payload.collectible
                if (!collectiblePayload) {
                    return
                }

                await tx.collectibleAsset.upsert({
                    where: { assetId },
                    create: {
                        assetId,
                        ...collectiblePayload,
                        acquisitionDate: collectiblePayload.acquisitionDate
                            ? new Date(collectiblePayload.acquisitionDate)
                            : null,
                        appraisalDate: collectiblePayload.appraisalDate
                            ? new Date(collectiblePayload.appraisalDate)
                            : null
                    },
                    update: {
                        ...collectiblePayload,
                        acquisitionDate: collectiblePayload.acquisitionDate
                            ? new Date(collectiblePayload.acquisitionDate)
                            : null,
                        appraisalDate: collectiblePayload.appraisalDate
                            ? new Date(collectiblePayload.appraisalDate)
                            : null,
                        deletedAt: null
                    }
                })
                return
            }
            case 'privateDeal': {
                const privateDealPayload = payload.privateDeal
                if (!privateDealPayload) {
                    return
                }

                await tx.privateDealAsset.upsert({
                    where: { assetId },
                    create: {
                        assetId,
                        ...privateDealPayload,
                        navDate: privateDealPayload.navDate ? new Date(privateDealPayload.navDate) : null
                    },
                    update: {
                        ...privateDealPayload,
                        navDate: privateDealPayload.navDate ? new Date(privateDealPayload.navDate) : null,
                        deletedAt: null
                    }
                })
                return
            }
            case 'vehicle': {
                const vehiclePayload = payload.vehicle
                if (!vehiclePayload) {
                    return
                }

                await tx.vehicleAsset.upsert({
                    where: { assetId },
                    create: {
                        assetId,
                        ...vehiclePayload,
                        purchaseDate: vehiclePayload.purchaseDate ? new Date(vehiclePayload.purchaseDate) : null
                    },
                    update: {
                        ...vehiclePayload,
                        purchaseDate: vehiclePayload.purchaseDate ? new Date(vehiclePayload.purchaseDate) : null,
                        deletedAt: null
                    }
                })
                return
            }
            case 'insurance': {
                const insurancePayload = payload.insurance
                if (!insurancePayload) {
                    return
                }

                await tx.insuranceAsset.upsert({
                    where: { assetId },
                    create: {
                        assetId,
                        ...insurancePayload,
                        startDate: insurancePayload.startDate ? new Date(insurancePayload.startDate) : null,
                        endDate: insurancePayload.endDate ? new Date(insurancePayload.endDate) : null
                    },
                    update: {
                        ...insurancePayload,
                        startDate: insurancePayload.startDate ? new Date(insurancePayload.startDate) : null,
                        endDate: insurancePayload.endDate ? new Date(insurancePayload.endDate) : null,
                        deletedAt: null
                    }
                })
                return
            }
        }
    }

    // Verifies that the target asset belongs to the authenticated user.
    private async ensureAssetOwnership(assetId: string, userId: string) {
        const asset = await prisma.asset.findFirst({
            where: { id: assetId, userId, deletedAt: null },
            select: { id: true }
        })

        if (!asset) {
            throw new NotFoundError('Asset not found')
        }
    }

    // Verifies that the linked cash account, when provided, belongs to the authenticated user.
    private async ensureFinancialAccountOwnership(financialAccountId: string | null | undefined, userId: string) {
        if (!financialAccountId) {
            return
        }

        const financialAccount = await prisma.financialAccount.findFirst({
            where: { id: financialAccountId, userId, deletedAt: null },
            select: { id: true }
        })

        if (!financialAccount) {
            throw new NotFoundError('Financial account not found')
        }
    }
}
