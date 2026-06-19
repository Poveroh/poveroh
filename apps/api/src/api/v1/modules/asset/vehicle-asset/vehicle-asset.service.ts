import type { AssetData, CreateVehicleAssetRequest, UpdateVehicleAssetRequest, VehicleAssetData } from '@poveroh/types'
import { AssetRepository } from '../asset/asset.repository'
import { BaseService } from '@/v1/modules/base/base.service'
import { eventBus } from '@/v1/worker/events/event-bus'
import { NotFoundError } from '@/utils'
import { VehicleAssetRepository } from './vehicle-asset.repository'

export class VehicleAssetService extends BaseService {
    private readonly vehicleAssetRepository = new VehicleAssetRepository()
    private readonly assetRepository = new AssetRepository()

    constructor() {
        super('vehicle-asset')
    }

    /**
     * Creates a vehicle asset for the current user along with its parent asset record, optionally storing an uploaded brand logo.
     * @param payload The data required to create the vehicle asset and its parent asset record.
     * @param file An optional uploaded brand logo to store and attach to the vehicle.
     * @returns A promise that resolves to the newly created asset, hydrated with subtype relations.
     */
    async createVehicleAsset(payload: CreateVehicleAssetRequest, file?: Express.Multer.File): Promise<AssetData> {
        const userId = this.context.currentUser.id

        const assetId = crypto.randomUUID()
        const payloadWithLogo = { ...payload }

        if (file) {
            payloadWithLogo.logoIcon = await this.media.saveFile(assetId, file)
        }

        await this.vehicleAssetRepository.create(userId, assetId, payloadWithLogo)

        const asset = await this.assetRepository.findById(userId, assetId)
        if (!asset) {
            throw new NotFoundError('Asset not found after creation')
        }

        await eventBus.emit('asset.created', { userId, data: asset })

        return asset
    }

    /**
     * Updates the vehicle metadata and parent asset value for the current user, optionally storing a new uploaded brand logo.
     * @param assetId The unique identifier of the parent asset being updated.
     * @param payload The fields used to update the vehicle asset.
     * @param file An optional uploaded brand logo to store and attach to the vehicle.
     */
    async updateVehicleAsset(
        assetId: string,
        payload: UpdateVehicleAssetRequest,
        file?: Express.Multer.File
    ): Promise<void> {
        const userId = this.context.currentUser.id

        const exists = await this.vehicleAssetRepository.exists(userId, assetId)
        if (!exists) {
            throw new NotFoundError('Vehicle asset not found')
        }

        const payloadWithLogo = { ...payload }

        if (file) {
            payloadWithLogo.logoIcon = await this.media.saveFile(assetId, file)
        }

        await this.vehicleAssetRepository.update(userId, assetId, payloadWithLogo)

        const data = await this.assetRepository.findById(userId, assetId)
        if (data) await eventBus.emit('asset.updated', { userId, data })
    }

    /**
     * Retrieves the vehicle metadata for the given parent asset belonging to the current user.
     * @param assetId The unique identifier of the parent asset being inspected.
     * @returns A promise that resolves to the vehicle asset metadata, or null when the asset has none.
     */
    async getVehicleAssetByAssetId(assetId: string): Promise<VehicleAssetData | null> {
        return this.vehicleAssetRepository.findByAssetId(this.context.currentUser.id, assetId)
    }
}
