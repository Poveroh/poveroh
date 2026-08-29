import type { JobDispatcher } from '@poveroh/types'
import config from '@/utils/environment'

/**
 * Registers the repeatable nightly job that syncs every linked bank connection across all users.
 * @param jobDispatcher The dispatcher used to register the repeatable job.
 * @returns A promise that resolves when the schedule has been upserted.
 */
export async function scheduleBankSyncDue(jobDispatcher: JobDispatcher): Promise<void> {
    // Runs at 01:00 by default (BANK_SYNC_CRON_PATTERN); the scheduler id defaults to the job name,
    // so changing the pattern and restarting the worker replaces this schedule rather than duplicating it.
    await jobDispatcher.schedule('bank-sync.sync-due', {}, config.BANK_SYNC_CRON_PATTERN)
}
