import { IDashboardLayout } from '@poveroh/types'
import { BaseService } from './base.service'

export class DashboardService extends BaseService<IDashboardLayout> {
    constructor() {
        super('/dashboard')
    }
}
