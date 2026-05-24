import type {
    AssetTransactionData,
    AssetTransactionFilters,
    CreateAssetTransactionRequest,
    UpdateAssetTransactionRequest
} from '@poveroh/types'
import { AssetTransactionRepository } from './asset-transaction.repository'
import { BadRequestError, NotFoundError } from '@/utils'
import { BaseService } from '@/v1/modules/base/base.service'
import { eventBus } from '@/v1/events/event-bus'

export class AssetTransactionService extends BaseService {
    private readonly assetTransactionRepository = new AssetTransactionRepository()

    constructor() {
        super('asset-transaction')
    }

    /**
     * Creates a new asset transaction for the current user after verifying ownership of the referenced asset and financial account.
     * @param payload The data required to create a new asset transaction.
     * @returns A promise that resolves to the newly created asset transaction.
     */
    async createAssetTransaction(payload: CreateAssetTransactionRequest): Promise<AssetTransactionData> {
        const userId = this.context.currentUser.id

        await this.ensureAssetOwnership(userId, payload.assetId)
        await this.ensureFinancialAccountOwnership(userId, payload.financialAccountId)

        const generatedId = crypto.randomUUID()
        const transaction = await this.assetTransactionRepository.create(generatedId, payload)

        await eventBus.emit('asset-transaction.created', {
            assetTransactionId: transaction.id,
            assetId: transaction.assetId,
            userId
        })

        return transaction
    }

    /**
     * Updates an existing asset transaction for the current user, re-verifying ownership when the payload changes the linked asset or financial account.
     * @param id The unique identifier of the asset transaction being updated.
     * @param payload The fields used to update the asset transaction.
     */
    async updateAssetTransaction(id: string, payload: UpdateAssetTransactionRequest): Promise<void> {
        const userId = this.context.currentUser.id

        const existingAssetId = await this.assetTransactionRepository.findAssetIdById(userId, id)
        if (!existingAssetId) {
            throw new NotFoundError('Asset transaction not found')
        }

        const targetAssetId = payload.assetId ?? existingAssetId
        await this.ensureAssetOwnership(userId, targetAssetId)
        await this.ensureFinancialAccountOwnership(userId, payload.financialAccountId ?? undefined)

        await this.assetTransactionRepository.update(userId, id, payload)
        await eventBus.emit('asset-transaction.updated', {
            assetTransactionId: id,
            assetId: targetAssetId,
            userId
        })
    }

    /**
     * Soft deletes a single asset transaction owned by the current user.
     * @param id The unique identifier of the asset transaction being deleted.
     */
    async deleteAssetTransaction(id: string): Promise<void> {
        const userId = this.context.currentUser.id

        const existingAssetId = await this.assetTransactionRepository.findAssetIdById(userId, id)
        if (!existingAssetId) {
            throw new NotFoundError('Asset transaction not found')
        }

        await this.assetTransactionRepository.softDelete(userId, id, new Date())
        await eventBus.emit('asset-transaction.deleted', {
            assetTransactionId: id,
            assetId: existingAssetId,
            userId
        })
    }

    /**
     * Soft deletes every asset transaction owned by the current user.
     */
    async deleteAllAssetTransactions(): Promise<void> {
        await this.assetTransactionRepository.softDeleteAll(this.context.currentUser.id, new Date())
    }

    /**
     * Retrieves an asset transaction by its ID for the current user.
     * @param id The unique identifier of the asset transaction being retrieved.
     * @returns A promise that resolves to the asset transaction data, or null when no matching row is found.
     */
    async getAssetTransactionById(id: string): Promise<AssetTransactionData | null> {
        return this.assetTransactionRepository.findById(this.context.currentUser.id, id)
    }

    /**
     * Retrieves a list of asset transactions for the current user based on the provided filters and pagination parameters.
     * @param filters The filters to apply when retrieving asset transactions.
     * @param skip The number of records to skip for pagination.
     * @param take The number of records to take for pagination.
     * @returns A promise that resolves to an array of asset transaction data matching the criteria.
     */
    async getAssetTransactions(
        filters: AssetTransactionFilters,
        skip: number,
        take: number
    ): Promise<AssetTransactionData[]> {
        return this.assetTransactionRepository.findMany(this.context.currentUser.id, filters, skip, take)
    }

    /**
     * Ensures the referenced asset exists and belongs to the user, throwing when the asset is missing or owned by another user.
     * @param userId The ID of the user expected to own the asset.
     * @param assetId The ID of the asset being verified.
     */
    private async ensureAssetOwnership(userId: string, assetId: string): Promise<void> {
        if (!assetId) {
            throw new BadRequestError('Missing asset reference')
        }

        const exists = await this.assetTransactionRepository.assetBelongsToUser(userId, assetId)
        if (!exists) {
            throw new NotFoundError('Asset not found')
        }
    }

    /**
     * Ensures the optional financial account reference belongs to the user, throwing when an account ID is supplied but unowned.
     * @param userId The ID of the user expected to own the financial account.
     * @param financialAccountId The optional ID of the financial account being verified.
     */
    private async ensureFinancialAccountOwnership(
        userId: string,
        financialAccountId: string | null | undefined
    ): Promise<void> {
        if (!financialAccountId) return

        const exists = await this.assetTransactionRepository.financialAccountBelongsToUser(userId, financialAccountId)
        if (!exists) {
            throw new NotFoundError('Financial account not found')
        }
    }
}
