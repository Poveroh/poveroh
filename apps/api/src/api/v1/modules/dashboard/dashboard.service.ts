import { NotFoundError } from '@/src/utils'
import prisma from '@poveroh/prisma'
import { GetDashboardLayout, UpdateDashboardLayoutRequest } from '@poveroh/types'
import { BaseService } from '../base/base.service'

/**
 * Service responsible for handling dashboard-related operations, such as retrieving and saving the dashboard layout for the authenticated user.
 * All methods automatically retrieve the user ID from the request context to ensure operations are performed for the correct user.
 */
export class DashboardService extends BaseService {
    constructor() {
        super('dashboard-layout')
    }

    /**
     * Retrieves the dashboard layout for the authenticated user.
     * User ID is automatically retrieved from request context
     * @returns A promise that resolves to the dashboard layout of the user
     */
    async getDashboardLayout(): Promise<GetDashboardLayout> {
        const userId = this.context.currentUser.id

        const layout = (await prisma.dashboardLayout.findUnique({
            where: { userId }
        })) as unknown as GetDashboardLayout | null

        if (!layout) {
            throw new NotFoundError('Dashboard layout not found')
        }

        return layout
    }

    /**
     * Saves the dashboard layout for the authenticated user.
     * User ID is automatically retrieved from request context
     * If a layout already exists, it will be updated; otherwise, a new layout will be created.
     * @param payload The dashboard layout data to be saved
     * @returns A promise that resolves when the dashboard layout has been saved
     */
    async saveDashboardLayout(payload: UpdateDashboardLayoutRequest): Promise<void> {
        const userId = this.context.currentUser.id

        await prisma.dashboardLayout.upsert({
            where: { userId },
            update: {
                layout: payload.layout,
                version: payload.version || 1
            },
            create: {
                userId,
                layout: payload.layout,
                version: payload.version || 1
            }
        })
    }
}
