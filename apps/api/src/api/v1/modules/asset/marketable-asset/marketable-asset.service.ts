import type {
    AssetData,
    CreateMarketableAssetRequest,
    MarketableAssetData,
    UpdateMarketableAssetRequest
} from '@poveroh/types'
import { AssetRepository } from '../asset/asset.repository'
import { BaseService } from '@/v1/modules/base/base.service'
import { eventBus } from '@/v1/worker/events/event-bus'
import { MarketableAssetRepository } from './marketable-asset.repository'
import { NotFoundError } from '@/utils'

export class MarketableAssetService extends BaseService {
    private readonly marketableAssetRepository = new MarketableAssetRepository()
    private readonly assetRepository = new AssetRepository()

    constructor() {
        super('marketable-asset')
    }

    /**
     * Creates a marketable asset for the current user along with its opening transaction, deriving the parent asset defaults from the symbol and asset class.
     * @param payload The data required to create the marketable asset and its opening transaction.
     * @returns A promise that resolves to the newly created asset, hydrated with subtype relations and active transactions.
     */
    async createMarketableAsset(payload: CreateMarketableAssetRequest): Promise<AssetData> {
        const userId = this.context.currentUser.id

        const assetId = crypto.randomUUID()
        await this.marketableAssetRepository.create(userId, assetId, payload)

        const asset = await this.assetRepository.findById(userId, assetId)
        if (!asset) {
            throw new NotFoundError('Asset not found after creation')
        }

        await eventBus.emit('asset.created', { userId, data: asset })

        return asset
    }

    /**
     * Updates the marketable metadata and parent currency for the current user, without touching transaction history.
     * @param assetId The unique identifier of the parent asset being updated.
     * @param payload The fields used to update the marketable asset.
     */
    async updateMarketableAsset(assetId: string, payload: UpdateMarketableAssetRequest): Promise<void> {
        const userId = this.context.currentUser.id

        const exists = await this.marketableAssetRepository.exists(userId, assetId)
        if (!exists) {
            throw new NotFoundError('Marketable asset not found')
        }

        await this.marketableAssetRepository.update(userId, assetId, payload)

        const data = await this.assetRepository.findById(userId, assetId)
        if (data) await eventBus.emit('asset.updated', { userId, data })
    }

    /**
     * Retrieves the marketable metadata for the given parent asset belonging to the current user.
     * @param assetId The unique identifier of the parent asset being inspected.
     * @returns A promise that resolves to the marketable asset metadata, or null when the asset has none.
     */
    async getMarketableAssetByAssetId(assetId: string): Promise<MarketableAssetData | null> {
        return this.marketableAssetRepository.findByAssetId(this.context.currentUser.id, assetId)
    }

    /**
     * Syncs the current market price onto the parent Asset and stamps the marketable metadata lastPriceSync.
     * @param assetId The unique identifier of the parent asset whose price is being synced.
     * @param price The new current price for the parent asset.
     * @param currency An optional currency override applied alongside the new price.
     */
    async syncCurrentPrice(assetId: string, price: number, currency?: string): Promise<void> {
        const userId = this.context.currentUser.id

        const updated = await this.marketableAssetRepository.syncCurrentPrice(userId, assetId, price, currency)
        if (!updated) {
            throw new NotFoundError('Marketable asset not found')
        }

        const data = await this.assetRepository.findById(userId, assetId)
        if (data) await eventBus.emit('asset.updated', { userId, data })
    }
}
