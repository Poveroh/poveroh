import type { AutoDepreciationData } from '@poveroh/types'
import { AutoDepreciationRepository } from './auto-depreciation.repository'
import { BaseService } from '@/v1/modules/base/base.service'

export class AutoDepreciationService extends BaseService {
    private readonly autoDepreciationRepository = new AutoDepreciationRepository()

    constructor() {
        super('auto-depreciation')
    }

    /**
     * Retrieves the active auto depreciation rules for the given asset belonging to the current user.
     * @param assetId The unique identifier of the asset being inspected.
     * @returns A promise that resolves to the active auto depreciation rules for the asset.
     */
    async getByAssetId(assetId: string): Promise<AutoDepreciationData[]> {
        return this.autoDepreciationRepository.findByAssetId(this.context.currentUser.id, assetId)
    }
}
