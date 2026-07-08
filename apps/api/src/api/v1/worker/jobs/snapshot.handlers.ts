import type { JobHandlers } from '@poveroh/types'
import { logger } from '@poveroh/logger/server'
import { SnapshotService } from '../../modules/snapshots/snapshot.service'

export const snapshotJobHandlers: JobHandlers = {
    'snapshot.generate': async payload => {
        // Generates the net-worth snapshot for a single user at a date, linking balances from the account time-series.
        const snapshotService = new SnapshotService()
        await snapshotService.generateSnapshot(payload.userId, payload.snapshotDate)

        logger.info('Snapshot generated', {
            userId: payload.userId,
            snapshotDate: payload.snapshotDate
        })
    },
    'snapshot.generate-due': async payload => {
        // Daily sweep: generates today's snapshot for every user who owns at least one active financial account.
        const snapshotService = new SnapshotService()
        const count = await snapshotService.generateDailySnapshots(payload.date)

        logger.info('Due snapshots generated', {
            date: payload.date ?? null,
            snapshots: count
        })
    }
}
