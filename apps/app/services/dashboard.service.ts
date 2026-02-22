import { getDashboard, putDashboard, type DashboardLayout } from '@/lib/api-client'

export class DashboardService {
    async readLayout() {
        const response = await getDashboard()
        return response.data
    }

    async saveLayout(layout: DashboardLayout) {
        const response = await putDashboard({
            body: { layout }
        })
        return response.data
    }
}
