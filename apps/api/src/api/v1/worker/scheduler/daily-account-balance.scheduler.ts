import type { JobDispatcher } from '@poveroh/types'

/**
 * Registers the repeatable daily job that materializes each account's balance into its time-series.
 * @param jobDispatcher The dispatcher used to register the repeatable job.
 * @returns A promise that resolves when the schedule has been upserted.
 */
export async function scheduleDailyAccountBalance(jobDispatcher: JobDispatcher): Promise<void> {
    // Runs every day at 01:00, before snapshot generation, so the day's balance point exists when snapshots link to it.
    await jobDispatcher.schedule('account-balance.materialize-daily', {}, '0 1 * * *')
}
