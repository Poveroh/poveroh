import { Currency } from '@prisma/client'
import prisma from '@poveroh/prisma'
import { CreateMarketableAssetRequestSchema, UpdateMarketableAssetRequestSchema } from '@poveroh/schemas'
import type {
    AssetData,
    CreateMarketableAssetRequest,
    MarketableAssetData,
    UpdateMarketableAssetRequest
} from '@poveroh/types'
import { BadRequestError, NotFoundError } from '@/src/utils'
import { assetInclude, isMarketableType, toIsoString } from '../helpers/asset.helper'
import { BaseService } from './base.service'

export class MarketableAssetService extends BaseService {
    constructor(userId: string) {
        super(userId, 'marketable-asset')
    }

    // Creates a marketable asset, or adds the opening transaction to an existing symbol-owned asset.
    async createMarketableAsset(payload: CreateMarketableAssetRequest): Promise<AssetData> {
        const userId = this.getUserId()
        const parsed = CreateMarketableAssetRequestSchema.parse(payload) as CreateMarketableAssetRequest

        const created = await prisma.$transaction(async tx => {
            const asset = await tx.asset.create({
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

            await tx.marketableAsset.create({
                data: {
                    assetId: asset.id,
                    symbol: parsed.symbol,
                    isin: parsed.isin ?? null,
                    exchange: parsed.exchange ?? null,
                    assetClass: parsed.assetClass ?? null,
                    sector: parsed.sector ?? null,
                    region: parsed.region ?? null
                }
            })

            await tx.assetTransaction.create({
                data: {
                    assetId: asset.id,
                    type: parsed.transactionType,
                    date: new Date(parsed.date),
                    quantityChange: parsed.quantity,
                    unitPrice: parsed.unitPrice,
                    totalAmount: parsed.quantity * parsed.unitPrice,
                    fees: parsed.fees,
                    currency: parsed.currency
                }
            })

            return tx.asset.findUniqueOrThrow({
                where: { id: asset.id },
                include: assetInclude
            })
        })

        return mapAsset(created)
    }

    // Updates common asset fields and marketable metadata without touching transaction history.
    async updateMarketableAsset(assetId: string, payload: UpdateMarketableAssetRequest): Promise<void> {
        const userId = this.getUserId()
        const parsed = UpdateMarketableAssetRequestSchema.parse(payload) as UpdateMarketableAssetRequest

        const existing = await prisma.asset.findFirst({
            where: {
                id: assetId,
                userId,
                deletedAt: null,
                marketable: { is: { deletedAt: null } }
            },
            select: { id: true }
        })

        if (!existing) {
            throw new NotFoundError('Marketable asset not found')
        }

        await prisma.$transaction(async tx => {
            await tx.asset.update({
                where: { id: assetId },
                data: {
                    ...(parsed.title !== undefined && { title: parsed.title }),
                    ...(parsed.currency !== undefined && { currency: parsed.currency }),
                    ...(parsed.currentValue !== undefined && { currentValue: parsed.currentValue }),
                    ...(parsed.currentValueAsOf !== undefined && {
                        currentValueAsOf: new Date(parsed.currentValueAsOf)
                    })
                }
            })

            await tx.marketableAsset.update({
                where: { assetId },
                data: {
                    ...(parsed.symbol !== undefined && { symbol: parsed.symbol }),
                    ...(parsed.isin !== undefined && { isin: parsed.isin }),
                    ...(parsed.exchange !== undefined && { exchange: parsed.exchange }),
                    ...(parsed.assetClass !== undefined && { assetClass: parsed.assetClass }),
                    ...(parsed.sector !== undefined && { sector: parsed.sector }),
                    ...(parsed.region !== undefined && { region: parsed.region })
                }
            })
        })
    }

    // Retrieves the marketable asset metadata for the given parent asset ID.
    async getMarketableAssetByAssetId(assetId: string): Promise<MarketableAssetData | null> {
        const userId = this.getUserId()

        const marketable = await prisma.marketableAsset.findFirst({
            where: {
                assetId,
                deletedAt: null,
                asset: { userId, deletedAt: null }
            }
        })

        if (!marketable) return null

        return {
            symbol: marketable.symbol,
            isin: marketable.isin ?? null,
            exchange: marketable.exchange ?? null,
            assetClass: marketable.assetClass ?? null,
            sector: marketable.sector ?? null,
            region: marketable.region ?? null,
            lastPriceSync: toIsoString(marketable.lastPriceSync)
        }
    }

    // Syncs the current market price into the parent Asset record and stamps lastPriceSync.
    async syncCurrentPrice(assetId: string, price: number, currency?: string): Promise<void> {
        const userId = this.getUserId()

        const asset = await prisma.asset.findFirst({
            where: { id: assetId, userId, deletedAt: null },
            select: { id: true }
        })

        if (!asset) {
            throw new NotFoundError('Asset not found')
        }

        const now = new Date()

        await prisma.$transaction([
            prisma.asset.update({
                where: { id: assetId },
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
    }

    /**
     * Checks if a marketable asset record exists for the given ID and belongs to the authenticated user.
     * @param id The ID of the marketable asset to check
     * @returns True if the marketable asset exists and belongs to the user, false otherwise
     */
    async doesMarketableAssetExist(id: string): Promise<boolean> {
        const asset = await this.getMarketableAssetByAssetId(id)

        return asset !== null
    }
}
