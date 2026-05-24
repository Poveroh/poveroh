import { createJobDispatcher, createJobWorker } from '@poveroh/queue'
import { logger } from '@poveroh/logger/server'
import { getRedisConnectionConfig } from '../../../utils/redis'
import { importJobHandlers } from './jobs/import.handlers'
import { snapshotJobHandlers } from './jobs/snapshot.handlers'

const redisConfig = getRedisConnectionConfig()
const jobDispatcher = createJobDispatcher(redisConfig)

const worker = createJobWorker(
    redisConfig,
    {
        ...snapshotJobHandlers,
        ...importJobHandlers
    },
    logger
)

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
