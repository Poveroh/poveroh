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
    AssetTypeEnum,
    CreateAssetRequest,
    CreateAssetTransactionRequest,
    CreateUpdateAssetRequest,
    PortfolioSummary,
    UpdateAssetRequest,
    UpdateAssetTransactionRequest
} from '@poveroh/types'
import { BadRequestError, NotFoundError } from '@/src/utils'
import {
    assetInclude,
    buildPositionMap,
    getSubtypeKeyByAssetType,
    isMarketableType,
    mapAsset,
    mapAssetTransaction,
    toNumber
} from '../helpers/asset.helper'
import { BaseService } from './base.service'
import { FinancialAccountService } from './financial-account.service'

export class AssetService extends BaseService {
    private financialAccountService: FinancialAccountService

    /**
     * Initializes the service with the authenticated user's ID and sets up related services.
     * @param userId The ID of the authenticated user, used for scoping all operations to their data
     */
    constructor(userId: string) {
        super(userId, 'asset')
        this.financialAccountService = new FinancialAccountService(userId)
    }

    // Creates a new non-marketable asset and persists its subtype details.
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
                    currentValue: parsed.currentValue,
                    currentValueAsOf: new Date(parsed.currentValueAsOf),
                    quantity: 0,
                    totalInvested: 0
                }
            })

            await this.persistSubtypeDetails(tx, createdAsset.id, parsed.type, parsed, false)

            return tx.asset.findUniqueOrThrow({
                where: { id: createdAsset.id },
                include: assetInclude
            })
        })

        return mapAsset(asset)
    }

    // Updates an existing non-marketable asset and keeps subtype records aligned when its family changes.
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

        if (isMarketableType(parsed.type ?? existingAsset.type)) {
            throw new BadRequestError('Use /assets/{id}/marketable to update marketable assets')
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
                        currentValueAsOf: new Date(parsed.currentValueAsOf)
                    })
                }
            })

            const effectiveType = parsed.type ?? existingAsset.type
            const assetTypeChanged = parsed.type !== undefined && parsed.type !== existingAsset.type

            if (assetTypeChanged) {
                await this.softDeleteSubtypeDetails(tx, id)
            }

            await this.persistSubtypeDetails(tx, id, effectiveType, parsed, !assetTypeChanged)
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

    /**
     * Soft deletes all assets for the authenticated user.
     */
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

    // Retrieves a single asset with its subtype details and computed position metrics.
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

    // GET /portfolio/summary
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

    // Soft deletes all subtype rows for an asset so it can safely switch type without stale data.
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
        type: AssetTypeEnum,
        payload: CreateUpdateAssetRequest,
        isUpdate: boolean
    ) {
        const subtypeKey = getSubtypeKeyByAssetType(type)

        if (!subtypeKey) {
            return
        }

        if (subtypeKey === 'marketable') {
            throw new BadRequestError('Use the dedicated marketable asset endpoint')
        }

        const subtypePayload = payload[subtypeKey]
        if (!subtypePayload) {
            if (!isUpdate) {
                throw new BadRequestError(`Missing subtype payload for ${type}`)
            }
            return
        }

        switch (subtypeKey) {
            case 'realEstate': {
                const realEstatePayload = payload.realEstate
                if (!realEstatePayload) return

                if (isUpdate) {
                    await tx.realEstateAsset.updateMany({
                        where: { assetId, deletedAt: null },
                        data: {
                            ...realEstatePayload,
                            purchaseDate: realEstatePayload.purchaseDate
                                ? new Date(realEstatePayload.purchaseDate)
                                : null,
                            deletedAt: null
                        }
                    })
                    return
                }

                const { address, type: realEstateType, purchasePrice } = realEstatePayload
                if (!address || !realEstateType || purchasePrice === undefined) {
                    throw new BadRequestError('Missing real estate subtype payload')
                }

                await tx.realEstateAsset.create({
                    data: {
                        assetId,
                        address,
                        type: realEstateType,
                        purchasePrice,
                        purchaseDate: realEstatePayload.purchaseDate ? new Date(realEstatePayload.purchaseDate) : null
                    }
                })
                return
            }
            case 'collectible': {
                const collectiblePayload = payload.collectible
                if (!collectiblePayload) return

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
                if (!privateDealPayload) return

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
                if (!vehiclePayload) return

                if (isUpdate) {
                    await tx.vehicleAsset.updateMany({
                        where: { assetId, deletedAt: null },
                        data: {
                            ...vehiclePayload,
                            purchaseDate: vehiclePayload.purchaseDate ? new Date(vehiclePayload.purchaseDate) : null,
                            deletedAt: null
                        }
                    })
                    return
                }

                const { brand, model, type: vehicleType, year, purchasePrice, plateNumber } = vehiclePayload
                if (
                    !brand ||
                    !model ||
                    !vehicleType ||
                    year === undefined ||
                    purchasePrice === undefined ||
                    !plateNumber
                ) {
                    throw new BadRequestError('Missing vehicle subtype payload')
                }

                await tx.vehicleAsset.create({
                    data: {
                        assetId,
                        brand,
                        model,
                        type: vehicleType,
                        year,
                        purchasePrice,
                        plateNumber,
                        vin: vehiclePayload.vin ?? null,
                        mileage: vehiclePayload.mileage ?? null,
                        condition: vehiclePayload.condition ?? null,
                        purchaseDate: vehiclePayload.purchaseDate ? new Date(vehiclePayload.purchaseDate) : null
                    }
                })
                return
            }
            case 'insurance': {
                const insurancePayload = payload.insurance
                if (!insurancePayload) return

                if (isUpdate) {
                    await tx.insuranceAsset.updateMany({
                        where: { assetId, deletedAt: null },
                        data: {
                            ...insurancePayload,
                            startDate: insurancePayload.startDate ? new Date(insurancePayload.startDate) : null,
                            endDate: insurancePayload.endDate ? new Date(insurancePayload.endDate) : null,
                            deletedAt: null
                        }
                    })
                    return
                }

                const {
                    insurer,
                    policyType,
                    policyNumber,
                    beneficiary,
                    premiumPaid,
                    premiumFrequency,
                    surrenderValue
                } = insurancePayload

                if (
                    !insurer ||
                    !policyType ||
                    !policyNumber ||
                    !beneficiary ||
                    premiumPaid === undefined ||
                    !premiumFrequency ||
                    surrenderValue === undefined
                ) {
                    throw new BadRequestError('Missing insurance subtype payload')
                }

                await tx.insuranceAsset.create({
                    data: {
                        assetId,
                        insurer,
                        policyType,
                        policyNumber,
                        beneficiary,
                        premiumPaid,
                        premiumFrequency,
                        surrenderValue,
                        startDate: insurancePayload.startDate ? new Date(insurancePayload.startDate) : null,
                        endDate: insurancePayload.endDate ? new Date(insurancePayload.endDate) : null
                    }
                })
                return
            }
        }
    }

    // Verifies that the target asset belongs to the authenticated user.
    async ensureAssetOwnership(assetId: string, userId: string) {
        const asset = await prisma.asset.findFirst({
            where: { id: assetId, userId, deletedAt: null },
            select: { id: true }
        })

        if (!asset) {
            throw new NotFoundError('Asset not found')
        }
    }
}
