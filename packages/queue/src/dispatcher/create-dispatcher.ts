import type { JobDispatcher, RedisConnectionConfig } from '@poveroh/types'
import { BullMQJobDispatcher } from '../adapters/bullmq/bullmq-dispatcher'

export function createJobDispatcher(redisConfig: RedisConnectionConfig): JobDispatcher {
    return new BullMQJobDispatcher(redisConfig)
}
