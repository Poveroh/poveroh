import { createJobDispatcher, createJobWorker } from '@poveroh/queue'
import { logger } from '@poveroh/logger/server'
import { getRedisConnectionConfig } from '../../../utils/redis'
import { assetJobHandlers } from './jobs/asset.handlers'
import { importJobHandlers } from './jobs/import.handlers'
import { snapshotJobHandlers } from './jobs/snapshot.handlers'
import { bankSyncJobHandlers } from './jobs/bank-sync.handlers'
import { scheduleSnapshotGeneration } from './scheduler/snapshot-due.scheduler'
import { scheduleBankSyncDue } from './scheduler/bank-sync-due.scheduler'

const redisConfig = getRedisConnectionConfig()
const jobDispatcher = createJobDispatcher(redisConfig)

const worker = createJobWorker(
    redisConfig,
    {
        ...snapshotJobHandlers,
        ...importJobHandlers,
        ...assetJobHandlers,
        ...bankSyncJobHandlers
    },
    logger
)

void scheduleSnapshotGeneration(jobDispatcher).catch(error => {
    logger.error('Failed to register the snapshot generation schedule', { error })
})

void scheduleBankSyncDue(jobDispatcher).catch(error => {
    logger.error('Failed to register the bank-sync schedule', { error })
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
