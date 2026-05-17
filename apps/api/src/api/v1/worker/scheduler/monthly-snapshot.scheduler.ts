import type { JobDispatcher } from '@poveroh/queue'

export async function scheduleMonthlySnapshot(
    jobDispatcher: JobDispatcher,
    userId: string,
    snapshotDate: string
): Promise<void> {
    await jobDispatcher.dispatch(
        'snapshot.generate',
        { userId, snapshotDate },
        {
            attempts: 3,
            backoff: { type: 'exponential', delay: 60_000 },
            deduplicationId: `snapshot.generate:${userId}:${snapshotDate}`
        }
    )
}
