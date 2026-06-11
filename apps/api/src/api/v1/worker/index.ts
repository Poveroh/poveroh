import { createJobDispatcher, createJobWorker } from '@poveroh/queue'
import { logger } from '@poveroh/logger/server'
import { getRedisConnectionConfig } from '../../../utils/redis'
import { accountBalanceJobHandlers } from './jobs/account-balance.handlers'
import { importJobHandlers } from './jobs/import.handlers'
import { snapshotJobHandlers } from './jobs/snapshot.handlers'
import { scheduleDailyAccountBalance } from './scheduler/daily-account-balance.scheduler'
import { scheduleSnapshotGeneration } from './scheduler/snapshot-due.scheduler'

const redisConfig = getRedisConnectionConfig()
const jobDispatcher = createJobDispatcher(redisConfig)

const worker = createJobWorker(
    redisConfig,
    {
        ...snapshotJobHandlers,
        ...importJobHandlers,
        ...accountBalanceJobHandlers
    },
    logger
)

void scheduleDailyAccountBalance(jobDispatcher).catch(error => {
    logger.error('Failed to register the daily account-balance schedule', { error })
})

void scheduleSnapshotGeneration(jobDispatcher).catch(error => {
    logger.error('Failed to register the snapshot generation schedule', { error })
})

logger.info('Poveroh worker started')

const shutdown = async () => {
    logger.info('Poveroh worker shutting down')
    await worker.close()

    if ('close' in jobDispatcher && typeof jobDispatcher.close === 'function') {
        await jobDispatcher.close()
    }

    process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
