import type { JobDispatcher } from '@poveroh/types'

/**
 * Registers the repeatable daily job that generates today's snapshot for every user with at least one active financial account.
 * @param jobDispatcher The dispatcher used to register the repeatable job.
 * @returns A promise that resolves when the schedule has been upserted.
 */
export async function scheduleSnapshotGeneration(jobDispatcher: JobDispatcher): Promise<void> {
    // Runs daily at 02:00, generating today's snapshot for every user with active financial accounts.
    await jobDispatcher.schedule('snapshot.generate-due', {}, '0 2 * * *')
}
