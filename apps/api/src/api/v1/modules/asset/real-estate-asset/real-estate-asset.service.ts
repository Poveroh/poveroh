import type {
    AssetData,
    CreateRealEstateAssetRequest,
    RealEstateAssetData,
    UpdateRealEstateAssetRequest
} from '@poveroh/types'
import { AssetRepository } from '../asset/asset.repository'
import { BaseService } from '@/v1/modules/base/base.service'
import { eventBus } from '@/v1/events/event-bus'
import { NotFoundError } from '@/utils'
import { RealEstateAssetRepository } from './real-estate-asset.repository'

export class RealEstateAssetService extends BaseService {
    private readonly realEstateAssetRepository = new RealEstateAssetRepository()
    private readonly assetRepository = new AssetRepository()

    constructor() {
        super('real-estate-asset')
    }

    /**
     * Creates a real estate asset for the current user along with its parent asset record.
     * @param payload The data required to create the real estate asset and its parent asset record.
     * @returns A promise that resolves to the newly created asset, hydrated with subtype relations.
     */
    async createRealEstateAsset(payload: CreateRealEstateAssetRequest): Promise<AssetData> {
        const userId = this.context.currentUser.id

        const assetId = crypto.randomUUID()
        await this.realEstateAssetRepository.create(userId, assetId, payload)

        const asset = await this.assetRepository.findById(userId, assetId)
        if (!asset) {
            throw new NotFoundError('Asset not found after creation')
        }

        await eventBus.emit('asset.created', { userId, data: asset })

        return asset
    }

    /**
     * Updates the real estate metadata and parent asset value for the current user.
     * @param assetId The unique identifier of the parent asset being updated.
     * @param payload The fields used to update the real estate asset.
     */
    async updateRealEstateAsset(assetId: string, payload: UpdateRealEstateAssetRequest): Promise<void> {
        const userId = this.context.currentUser.id

        const exists = await this.realEstateAssetRepository.exists(userId, assetId)
        if (!exists) {
            throw new NotFoundError('Real estate asset not found')
        }

        await this.realEstateAssetRepository.update(userId, assetId, payload)

        const data = await this.assetRepository.findById(userId, assetId)
        if (data) await eventBus.emit('asset.updated', { userId, data })
    }

    /**
     * Retrieves the real estate metadata for the given parent asset belonging to the current user.
     * @param assetId The unique identifier of the parent asset being inspected.
     * @returns A promise that resolves to the real estate asset metadata, or null when the asset has none.
     */
    async getRealEstateAssetByAssetId(assetId: string): Promise<RealEstateAssetData | null> {
        return this.realEstateAssetRepository.findByAssetId(this.context.currentUser.id, assetId)
    }
}
