import { GetDashboardLayout, UpdateDashboardLayoutRequest } from '@poveroh/types'
import { NotFoundError } from '@/utils'
import { BaseService } from '../base/base.service'
import { DashboardRepository } from './dashboard.repository'
import { eventBus } from '../../worker/events/event-bus'

/**
 * Service responsible for handling dashboard-related operations, such as retrieving and saving the dashboard layout for the authenticated user.
 * All methods automatically retrieve the user ID from the request context to ensure operations are performed for the correct user.
 */
export class DashboardService extends BaseService {
    private readonly dashboardRepository = new DashboardRepository()

    constructor() {
        super('dashboard-layout')
    }

    /**
     * Retrieves the dashboard layout for the authenticated user.
     * @returns A promise that resolves to the dashboard layout of the user
     */
    async getDashboardLayout(): Promise<GetDashboardLayout> {
        const userId = this.context.currentUser.id

        const layout = await this.dashboardRepository.getDashboardLayout(userId)

        if (!layout) {
            throw new NotFoundError('Dashboard layout not found')
        }

        return layout
    }

    /**
     * Saves the dashboard layout for the authenticated user.
     * If a layout already exists, it will be updated; otherwise, a new layout will be created.
     * @param payload The dashboard layout data to be saved
     * @returns A promise that resolves when the dashboard layout has been saved
     */
    async saveDashboardLayout(payload: UpdateDashboardLayoutRequest): Promise<void> {
        const userId = this.context.currentUser.id

        await this.dashboardRepository.saveDashboardLayout(userId, payload)

        const data = await this.dashboardRepository.getDashboardLayout(userId)
        if (data) await eventBus.emit('dashboard.updated', { userId, data })
    }
}
