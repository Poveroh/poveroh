import type {
    AssetData,
    CollectibleAssetData,
    CreateCollectibleAssetRequest,
    UpdateCollectibleAssetRequest
} from '@poveroh/types'
import { AssetRepository } from '../asset/asset.repository'
import { BaseService } from '@/v1/modules/base/base.service'
import { CollectibleAssetRepository } from './collectible-asset.repository'
import { eventBus } from '@/v1/worker/events/event-bus'
import { NotFoundError } from '@/utils'

export class CollectibleAssetService extends BaseService {
    private readonly collectibleAssetRepository = new CollectibleAssetRepository()
    private readonly assetRepository = new AssetRepository()

    constructor() {
        super('collectible-asset')
    }

    /**
     * Creates a collectible asset for the current user along with its parent asset record.
     * @param payload The data required to create the collectible asset and its parent asset record.
     * @returns A promise that resolves to the newly created asset, hydrated with subtype relations.
     */
    async createCollectibleAsset(payload: CreateCollectibleAssetRequest): Promise<AssetData> {
        const userId = this.context.currentUser.id

        const assetId = crypto.randomUUID()
        await this.collectibleAssetRepository.create(userId, assetId, payload)

        const asset = await this.assetRepository.findById(userId, assetId)
        if (!asset) {
            throw new NotFoundError('Asset not found after creation')
        }

        await eventBus.emit('asset.created', { userId, data: asset })

        return asset
    }

    /**
     * Updates the collectible metadata and parent asset value for the current user.
     * @param assetId The unique identifier of the parent asset being updated.
     * @param payload The fields used to update the collectible asset.
     */
    async updateCollectibleAsset(assetId: string, payload: UpdateCollectibleAssetRequest): Promise<void> {
        const userId = this.context.currentUser.id

        const exists = await this.collectibleAssetRepository.exists(userId, assetId)
        if (!exists) {
            throw new NotFoundError('Collectible asset not found')
        }

        await this.collectibleAssetRepository.update(userId, assetId, payload)

        const data = await this.assetRepository.findById(userId, assetId)
        if (data) await eventBus.emit('asset.updated', { userId, data })
    }

    /**
     * Retrieves the collectible metadata for the given parent asset belonging to the current user.
     * @param assetId The unique identifier of the parent asset being inspected.
     * @returns A promise that resolves to the collectible asset metadata, or null when the asset has none.
     */
    async getCollectibleAssetByAssetId(assetId: string): Promise<CollectibleAssetData | null> {
        return this.collectibleAssetRepository.findByAssetId(this.context.currentUser.id, assetId)
    }
}
