import prisma from '@poveroh/prisma'
import { buildWhere } from '../../../helpers/filter.helper'
import { NetWorthEvolutionFilters, NetWorthEvolutionReport } from '@poveroh/types'
import { BaseService } from './base.service'

/**
 * Service class for generating reports for the authenticated user
 * All methods automatically retrieve the user ID from the request context.
 */
export class ReportService extends BaseService {
    /**
     * Initializes the ReportService with the user ID from the request context
     * @param userId The ID of the authenticated user
     */
    constructor(userId: string) {
        super(userId, 'report')
    }

    /**
     * Retrieves the net worth trend report for the authenticated user
     * @param filters The filters to apply to the report query
     * @returns The net worth evolution report
     */
    async getNetWorthTrend(filters: Partial<NetWorthEvolutionFilters>): Promise<NetWorthEvolutionReport> {
        const userId = this.getUserId()

        const whereFilters = {
            ...filters,
            ...(filters?.date ? { snapshotDate: filters.date } : {})
        }

        if (filters?.date) {
            delete (whereFilters as Partial<NetWorthEvolutionFilters>).date
        }

        const where = buildWhere(whereFilters)

        const whereCondition = {
            ...where,
            userId
        }

        const data = await prisma.snapshot.findMany({
            where: whereCondition,
            orderBy: { snapshotDate: 'asc' }
        })

        const evolution = data.map(snapshot => ({
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
