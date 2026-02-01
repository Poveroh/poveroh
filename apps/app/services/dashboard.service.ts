import { DashboardLayout, IDashboardLayout } from '@poveroh/types'
import { BaseService } from './base.service'
import { server } from '@/lib/server'

export class DashboardService extends BaseService<IDashboardLayout> {
    constructor() {
        super('/dashboard')
    }

    async readLayout(): Promise<IDashboardLayout | null> {
        return server.get<IDashboardLayout | null>('/dashboard')
    }

    async saveLayout(layout: DashboardLayout): Promise<IDashboardLayout> {
        return server.put<IDashboardLayout>('/dashboard', { layout })
    }
}
