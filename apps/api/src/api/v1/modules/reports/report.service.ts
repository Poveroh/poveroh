import type { NetWorthEvolutionFilters, NetWorthEvolutionReport } from '@poveroh/types'
import { BaseService } from '../base/base.service'
import { ReportRepository } from './report.repository'

/**
 * Service class for generating reports for the authenticated user.
 * All methods automatically retrieve the user ID from the request context.
 */
export class ReportService extends BaseService {
    private readonly reportRepository = new ReportRepository()

    constructor() {
        super('report')
    }

    /**
     * Retrieves the net worth evolution report for the authenticated user, mapping the underlying snapshots into a public report shape.
     * @param filters The filters to apply when querying snapshots that compose the report.
     * @returns A promise that resolves to the net worth evolution report containing the current net worth and the historical evolution series.
     */
    async getNetWorthTrend(filters: Partial<NetWorthEvolutionFilters>): Promise<NetWorthEvolutionReport> {
        const userId = this.context.currentUser.id

        const snapshots = await this.reportRepository.findSnapshotsForNetWorth(userId, filters)

        const evolution = snapshots.map(snapshot => ({
            date: snapshot.snapshotDate.toISOString(),
            netWorth: Number(snapshot.totalNetWorth)
        }))

        const currentNetWorth = evolution.length > 0 ? evolution[evolution.length - 1].netWorth : 0

        return {
            currentNetWorth,
            evolution
        }
    }
}
