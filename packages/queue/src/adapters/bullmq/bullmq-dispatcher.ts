import { Queue } from 'bullmq'
import {
    DEFAULT_QUEUE_NAME,
    DispatchOptions,
    JobDispatcher,
    JobMap,
    JobName,
    type RedisConnectionConfig
} from '@poveroh/types'
import { createBullMQConnectionOptions } from './redis-connection'

export class BullMQJobDispatcher implements JobDispatcher {
    private readonly queue: Queue

    constructor(redisConfig: RedisConnectionConfig, queueName: string = DEFAULT_QUEUE_NAME) {
        this.queue = new Queue(queueName, {
            connection: createBullMQConnectionOptions(redisConfig)
        })
    }

    async dispatch<TJobName extends JobName>(
        jobName: TJobName,
        payload: JobMap[TJobName],
        options: DispatchOptions = {}
    ): Promise<void> {
        await this.queue.add(jobName, payload, {
            attempts: options.attempts,
            delay: options.delay,
            backoff: options.backoff,
            jobId: options.deduplicationId,
            removeOnComplete: options.removeOnComplete ?? true,
            removeOnFail: options.removeOnFail ?? 100
        })
    }

    async close(): Promise<void> {
        await this.queue.close()
    }
}
