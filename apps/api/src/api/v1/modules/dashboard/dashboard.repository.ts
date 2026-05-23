import type { GetDashboardLayout, UpdateDashboardLayoutRequest } from '@poveroh/types'
import prisma from '@poveroh/prisma'

export class DashboardRepository {
    /**
     * Retrieves the dashboard layout for a specific user.
     * @param userId The ID of the user whose dashboard layout is being retrieved.
     * @returns A promise that resolves to the dashboard layout of the user, or null if no layout is found.
     */
    async getDashboardLayout(userId: string): Promise<GetDashboardLayout | null> {
        return (await prisma.dashboardLayout.findUnique({
            where: { userId }
        })) as unknown as GetDashboardLayout | null
    }

    /**
     * Saves the dashboard layout for a specific user.
     * If a layout already exists for the user, it will be updated; otherwise, a new layout will be created.
     * @param userId The ID of the user for whom the dashboard layout is being saved.
     * @param payload The dashboard layout data to be saved.
     */
    async saveDashboardLayout(userId: string, payload: UpdateDashboardLayoutRequest) {
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
