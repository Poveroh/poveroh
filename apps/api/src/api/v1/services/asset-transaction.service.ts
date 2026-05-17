import type {
    AssetTransactionData,
    AssetTransactionFilters,
    CreateAssetTransactionRequest,
    UpdateAssetTransactionRequest
} from '@poveroh/types'
import { BaseService } from './base.service'
import { AssetService } from './asset.service'

/**
 * Thin wrapper around AssetService for asset transaction operations.
 * All transaction logic lives in AssetService; this service exists as a
 * convenience entry-point when callers do not need full asset context.
 */
export class AssetTransactionService extends BaseService {
    private assetService: AssetService

    constructor(userId: string) {
        super(userId, 'asset-transaction')
        this.assetService = new AssetService(userId)
    }

    // Creates a new asset transaction after verifying asset and linked account ownership.
    async createAssetTransaction(payload: CreateAssetTransactionRequest): Promise<AssetTransactionData> {
        const userId = this.getUserId()
        const parsed = CreateAssetTransactionRequestSchema.parse(payload) as CreateAssetTransactionRequest

        await this.ensureAssetOwnership(parsed.assetId, userId)
        await this.financialAccountService.ensureFinancialAccountOwnership(parsed.financialAccountId, userId)

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
                asset: { userId, deletedAt: null }
            },
            select: { id: true, assetId: true }
        })

        if (!existingTransaction) {
            throw new NotFoundError('Asset transaction not found')
        }

        const targetAssetId = parsed.assetId ?? existingTransaction.assetId
        await this.ensureAssetOwnership(targetAssetId, userId)
        await this.financialAccountService.ensureFinancialAccountOwnership(parsed.financialAccountId, userId)

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
                asset: { userId, deletedAt: null }
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
                asset: { userId, deletedAt: null }
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
                asset: { userId, deletedAt: null }
            }
        })

        return transaction ? mapAssetTransaction(transaction) : null
    }

    // Retrieves filtered asset transactions, optionally scoped to a specific set of asset IDs.
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
            asset: { userId, deletedAt: null }
        }

        const transactions = await prisma.assetTransaction.findMany({
            where,
            orderBy: { date: 'desc' },
            skip,
            take
        })

        return transactions.map(mapAssetTransaction)
    }

    // Retrieves filtered asset transactions with optional pagination.
    async getAssetTransactions(
        filters: AssetTransactionFilters,
        skip: number,
        take: number
    ): Promise<AssetTransactionData[]> {
        return this.assetService.getAssetTransactions(filters, skip, take)
    }
}
