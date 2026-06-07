import type { AssetData, CreateOtherAssetRequest, OtherAssetData, UpdateOtherAssetRequest } from '@poveroh/types'
import { AssetRepository } from '../asset/asset.repository'
import { BaseService } from '@/v1/modules/base/base.service'
import { eventBus } from '@/v1/events/event-bus'
import { NotFoundError } from '@/utils'
import { OtherAssetRepository } from './other-asset.repository'

export class OtherAssetService extends BaseService {
    private readonly otherAssetRepository = new OtherAssetRepository()
    private readonly assetRepository = new AssetRepository()

    constructor() {
        super('other-asset')
    }

    /**
     * Creates an other asset for the current user along with its parent asset record.
     * @param payload The data required to create the other asset and its parent asset record.
     * @returns A promise that resolves to the newly created asset, hydrated with subtype relations.
     */
    async createOtherAsset(payload: CreateOtherAssetRequest): Promise<AssetData> {
        const userId = this.context.currentUser.id

        const assetId = crypto.randomUUID()
        await this.otherAssetRepository.create(userId, assetId, payload)

        const asset = await this.assetRepository.findById(userId, assetId)
        if (!asset) {
            throw new NotFoundError('Asset not found after creation')
        }

        await eventBus.emit('asset.created', { userId, data: asset })

        return asset
    }

    /**
     * Updates the other asset metadata and parent asset value for the current user.
     * @param assetId The unique identifier of the parent asset being updated.
     * @param payload The fields used to update the other asset.
     */
    async updateOtherAsset(assetId: string, payload: UpdateOtherAssetRequest): Promise<void> {
        const userId = this.context.currentUser.id

        const exists = await this.otherAssetRepository.exists(userId, assetId)
        if (!exists) {
            throw new NotFoundError('Other asset not found')
        }

        await this.otherAssetRepository.update(userId, assetId, payload)

        const data = await this.assetRepository.findById(userId, assetId)
        if (data) await eventBus.emit('asset.updated', { userId, data })
    }

    /**
     * Retrieves the other asset metadata for the given parent asset belonging to the current user.
     * @param assetId The unique identifier of the parent asset being inspected.
     * @returns A promise that resolves to the other asset metadata, or null when the asset has none.
     */
    async getOtherAssetByAssetId(assetId: string): Promise<OtherAssetData | null> {
        return this.otherAssetRepository.findByAssetId(this.context.currentUser.id, assetId)
    }
}
