import type { AssetData, AssetFilters } from '@poveroh/types'
import { AssetRepository, type PortfolioSummary } from './asset.repository'
import { BaseService } from '@/v1/modules/base/base.service'
import { eventBus } from '@/v1/events/event-bus'

export class AssetService extends BaseService {
    private readonly assetRepository = new AssetRepository()

    constructor() {
        super('asset')
    }

    /**
     * Soft deletes a single asset for the current user, including all its subtype rows.
     * @param id The unique identifier of the asset being deleted.
     */
    async deleteAsset(id: string): Promise<void> {
        const userId = this.context.currentUser.id
        const deleted = await this.assetRepository.softDelete(userId, id, new Date())
        if (!deleted) return

        await eventBus.emit('asset.updated', { assetId: id, userId })
    }

    /**
     * Soft deletes every asset owned by the current user, including their subtype rows.
     */
    async deleteAllAssets(): Promise<void> {
        await this.assetRepository.softDeleteAll(this.context.currentUser.id, new Date())
    }

    /**
     * Retrieves an asset by its ID for the current user, returning subtype relations and active transactions.
     * @param id The unique identifier of the asset being retrieved.
     * @returns A promise that resolves to the asset data, or null when no matching row is found.
     */
    async getAssetById(id: string): Promise<AssetData | null> {
        return this.assetRepository.findById(this.context.currentUser.id, id)
    }

    /**
     * Retrieves a list of assets for the current user based on the provided filters and pagination parameters.
     * @param filters The filters to apply when retrieving assets.
     * @param skip The number of records to skip for pagination.
     * @param take The number of records to take for pagination.
     * @returns A promise that resolves to an array of asset data matching the criteria.
     */
    async getAssets(filters: AssetFilters, skip: number, take: number): Promise<AssetData[]> {
        return this.assetRepository.findMany(this.context.currentUser.id, filters, skip, take)
    }

    /**
     * Aggregates the current user's assets into a portfolio summary grouped by asset type.
     * @returns A promise that resolves to the portfolio summary for the current user.
     */
    async getPortfolioSummary(): Promise<PortfolioSummary> {
        return this.assetRepository.getPortfolioSummary(this.context.currentUser.id)
    }
}
