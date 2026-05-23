import { Worker } from 'bullmq'
import { DEFAULT_QUEUE_NAME, JobHandlers, JobMap, JobName, type RedisConnectionConfig } from '@poveroh/types'
import { createBullMQConnectionOptions } from './redis-connection'

export type WorkerLogger = {
    info(message: string, meta?: Record<string, unknown>): void
    warn(message: string, meta?: Record<string, unknown>): void
    error(message: string, meta?: Record<string, unknown>): void
}

export function createBullMQWorker(
    redisConfig: RedisConnectionConfig,
    handlers: JobHandlers,
    logger: WorkerLogger,
    queueName: string = DEFAULT_QUEUE_NAME
): Worker<JobMap[JobName], void, JobName> {
    const worker = new Worker<JobMap[JobName], void, JobName>(
        queueName,
        async job => {
            logger.info('Worker job started', { jobId: job.id, jobName: job.name, attempt: job.attemptsMade + 1 })

            const handler = handlers[job.name] as ((payload: JobMap[JobName]) => Promise<void>) | undefined
            if (!handler) {
                logger.warn('Worker job skipped because no handler is registered', { jobId: job.id, jobName: job.name })
                return
            }

            await handler(job.data)
        },
        {
            connection: createBullMQConnectionOptions(redisConfig)
        }
    )

    worker.on('completed', job => {
        logger.info('Worker job completed', { jobId: job.id, jobName: job.name })
    })

    worker.on('failed', (job, error) => {
        logger.error('Worker job failed', {
            jobId: job?.id,
            jobName: job?.name,
            attemptsMade: job?.attemptsMade,
            error: error.message
        })
    })

    worker.on('error', error => {
        logger.error('Worker runtime error', { error: error.message })
    })

    return worker
}
