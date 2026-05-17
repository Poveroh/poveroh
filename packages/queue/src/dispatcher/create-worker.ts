import { DEFAULT_QUEUE_NAME, JobHandlers, type RedisConnectionConfig } from '@poveroh/types'
import { createBullMQWorker, type WorkerLogger } from '../adapters/bullmq/bullmq-worker'

export function createJobWorker(
    redisConfig: RedisConnectionConfig,
    handlers: JobHandlers,
    logger: WorkerLogger,
    queueName: string = DEFAULT_QUEUE_NAME
) {
    return createBullMQWorker(redisConfig, handlers, logger, queueName)
}
