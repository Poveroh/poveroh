import { IBalance, IReports } from '@poveroh/types'
import { BaseService } from './base.service'
import { server } from '@/lib/server'

export class BalanceService extends BaseService<IBalance> {
    constructor() {
        super('/balance')
    }

    async getTotalBalance(): Promise<IBalance> {
        return await server.get<IBalance>('/balance/total')
    }

    async getReports(): Promise<IReports> {
        return await server.get<IReports>('/balance/reports')
    }
}
