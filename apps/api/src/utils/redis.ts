import { createRedisClient } from '@poveroh/redis'
import { type RedisConnectionConfig } from '@poveroh/types'
import config from './environment'

// Reads connection settings from env so the API and BullMQ workers share the same config.
export const getRedisConnectionConfig = (): RedisConnectionConfig => ({
    url: config.REDIS_URL ?? 'redis://localhost:6379',
    password: config.REDIS_PASSWORD || undefined
})

// Initializes the shared Redis client using the API's env-derived config. Called once at startup.
export const initRedisClient = () => createRedisClient(getRedisConnectionConfig())
