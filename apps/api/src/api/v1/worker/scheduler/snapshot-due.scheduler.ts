import type { JobDispatcher } from '@poveroh/types'

/**
 * Registers the repeatable daily job that generates snapshots for users whose configured frequency is due.
 * @param jobDispatcher The dispatcher used to register the repeatable job.
 * @returns A promise that resolves when the schedule has been upserted.
 */
export async function scheduleSnapshotGeneration(jobDispatcher: JobDispatcher): Promise<void> {
    // Runs daily at 02:00, after the balance materialization, deciding per user whether a snapshot is due today.
    await jobDispatcher.schedule('snapshot.generate-due', {}, '0 2 * * *')
}
