import prisma, { Prisma } from '@poveroh/prisma'
import type { NetWorthEvolutionFilters } from '@poveroh/types'
import { buildWhere } from '@/helpers/filter.helper'
import { snapshotSelect } from '@/types/select'

type SnapshotRow = Prisma.SnapshotGetPayload<{ select: typeof snapshotSelect }>

export class ReportRepository {
    /**
     * Finds the snapshots that match the provided net worth evolution filters for the specified user, ordered by snapshot date in ascending order.
     * @param userId The ID of the user who owns the snapshots being retrieved.
     * @param filters The filters to apply when retrieving snapshots, optionally including a target snapshot date.
     * @returns A promise that resolves to an array of snapshot rows containing only the snapshot date and total net worth fields.
     */
    async findSnapshotsForNetWorth(userId: string, filters: Partial<NetWorthEvolutionFilters>): Promise<SnapshotRow[]> {
        const { date, ...rest } = filters
        const whereFilters = {
            ...rest,
            ...(date ? { snapshotDate: date } : {}),
            userId
        }

        const where = buildWhere(whereFilters, [])

        return prisma.snapshot.findMany({
            where,
            select: snapshotSelect,
            orderBy: { snapshotDate: 'asc' }
        })
    }
}
