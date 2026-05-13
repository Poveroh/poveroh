import { Currency } from '@prisma/client'
import prisma, { Prisma } from '@poveroh/prisma'
import type { CreateMarketableAsset, MarketableAsset, MarketableAssetData } from '@poveroh/types'
import { NotFoundError } from '@/src/utils'
import { BaseService } from './base.service'

export class MarketableAssetService extends BaseService {
    constructor(userId: string) {
        super(userId, 'marketable-asset')
    }

    /**
     * Creates a marketable asset along with an initial transaction. If the asset already exists, it will create a new transaction and update the symbol.
     * @param assetId The ID of the parent asset record, which must already exist and belong to the user. This service does not create the parent asset record.
     * @param payload The marketable asset data along with the initial transaction details. The payload includes both the metadata for the marketable asset (like symbol) and the details of the transaction (like quantity, unit price, etc.).
     * @param tx An optional Prisma transaction client. If provided, all database operations will be executed within this transaction. If not provided, a new transaction will be created for the operations in this method. This allows the caller to control transaction boundaries when calling this method as part of a larger set of operations.
     * @returns The created MarketableAssetData, which includes the metadata of the marketable asset. The transaction details are not returned in this response, but they are stored in the database and can be retrieved through other service methods if needed.
     */
    async createMarketableAsset(
        assetId: string,
        payload: CreateMarketableAsset,
        tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
    ): Promise<MarketableAssetData> {
        const client = tx ?? prisma

        // Only the symbol field belongs on the instrument record — the rest is transaction data.
        const marketableRow = await client.marketableAsset.upsert({
            where: { assetId },
            create: { assetId, symbol: payload.symbol },
            update: { symbol: payload.symbol, deletedAt: null }
        })

        // totalAmount is the gross cost before fees so position math stays consistent.
        const totalAmount = payload.quantity * payload.unitPrice

        await client.assetTransaction.create({
            data: {
                assetId,
                type: payload.transactionType,
                date: new Date(payload.date),
                quantityChange: payload.quantity,
                unitPrice: payload.unitPrice,
                totalAmount,
                fees: payload.fees,
                currency: payload.currency as Currency
            }
        })

        return mapMarketableAsset(marketableRow)
    }

    // Updates the instrument metadata fields without touching the transaction history.
    async updateMarketableAsset(assetId: string, data: Partial<MarketableAssetMetadata>): Promise<void> {
        const userId = this.getUserId()

        const existing = await prisma.marketableAsset.findFirst({
            where: {
                assetId,
                deletedAt: null,
                asset: { userId, deletedAt: null }
            },
            select: { id: true }
        })

        if (!existing) {
            throw new NotFoundError('Marketable asset not found')
        }

        await prisma.marketableAsset.update({
            where: { assetId },
            data: {
                ...(data.symbol !== undefined && { symbol: data.symbol }),
                ...(data.isin !== undefined && { isin: data.isin }),
                ...(data.exchange !== undefined && { exchange: data.exchange }),
                ...(data.assetClass !== undefined && { assetClass: data.assetClass }),
                ...(data.sector !== undefined && { sector: data.sector }),
                ...(data.region !== undefined && { region: data.region })
            }
        })
    }

    // Returns the MarketableAsset record for the given asset, or null when not found.
    async getMarketableAssetByAssetId(assetId: string): Promise<MarketableAssetData> {
        const userId = this.getUserId()

        return (await prisma.marketableAsset.findFirst({
            where: {
                assetId,
                deletedAt: null,
                asset: { userId, deletedAt: null }
            }
        })) as unknown as MarketableAssetData
    }

    // Updates the parent asset's current value and stamps the last price sync timestamp.
    // Call this after fetching a live quote from a market data provider.
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
}
