import prisma from '@poveroh/prisma'
import { CreateAssetTransactionRequestSchema, UpdateAssetTransactionRequestSchema } from '@poveroh/schemas'
import type { AssetTransactionData, CreateAssetTransactionRequest, UpdateAssetTransactionRequest } from '@poveroh/types'
import { NotFoundError } from '@/src/utils'
import { BaseService } from './base.service'
import { FinancialAccountService } from './financial-account.service'
import { AssetService } from './asset.service'

export class AssetTransactionService extends BaseService {
    financialAccountService: FinancialAccountService
    assetService: AssetService

    constructor(userId: string) {
        super(userId, 'asset-transaction')
        this.financialAccountService = new FinancialAccountService(userId)
        this.assetService = new AssetService(userId)
    }

    // Creates a new asset transaction after verifying asset and linked account ownership.
    async createAssetTransaction(payload: CreateAssetTransactionRequest): Promise<AssetTransactionData> {
        const userId = this.getUserId()
        const parsed = CreateAssetTransactionRequestSchema.parse(payload) as CreateAssetTransactionRequest

        await this.assetService.ensureAssetOwnership(parsed.assetId, userId)
        await this.financialAccountService.ensureFinancialAccountOwnership(parsed.financialAccountId, userId)

        return (await prisma.assetTransaction.create({
            data: parsed
        })) as unknown as AssetTransactionData
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
        await this.assetService.ensureAssetOwnership(targetAssetId, userId)
        await this.financialAccountService.ensureFinancialAccountOwnership(parsed.financialAccountId, userId)

        await prisma.assetTransaction.update({
            where: { id },
            data: parsed
        })
    }

    /**
     * Soft deletes an asset transaction by ID after verifying ownership. The transaction is not permanently removed from the database, but is marked as deleted and excluded from future queries.
     * @param id The ID of the asset transaction to delete
     * @throws NotFoundError if the asset transaction does not exist or does not belong to the authenticated user
     */
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

    /**
     * Soft deletes all asset transactions for the authenticated user. The transactions are not permanently removed from the database, but are marked as deleted and excluded from future queries.
     */
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

    /**
     * Retrieves a single asset transaction by ID for the authenticated user.
     * @param id The ID of the asset transaction to retrieve
     * @returns The asset transaction data if found, or null if not found
     */
    async getAssetTransactionById(id: string): Promise<AssetTransactionData> {
        const userId = this.getUserId()

        return (await prisma.assetTransaction.findFirst({
            where: {
                id,
                deletedAt: null,
                asset: {
                    userId,
                    deletedAt: null
                }
            }
        })) as unknown as AssetTransactionData
    }
}
