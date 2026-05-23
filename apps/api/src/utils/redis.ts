import { createRedisClient } from '@poveroh/redis'
import { type RedisConnectionConfig } from '@poveroh/types'
import config from './environment'

/**
 * Constructs the Redis connection configuration using environment variables. It reads the Redis URL and password from the configuration and returns an object that can be used to initialize a Redis client.
 * @returns An object containing the Redis connection configuration, including the URL and password if provided.
 */
export const getRedisConnectionConfig = (): RedisConnectionConfig => ({
    url: config.REDIS_URL ?? 'redis://localhost:6379',
    password: config.REDIS_PASSWORD || undefined
})

/**
 * Initializes and returns a Redis client using the connection configuration derived from environment variables.
 * @returns A Redis client instance that can be used for interacting with the Redis server.
 */
export const initRedisClient = () => createRedisClient(getRedisConnectionConfig())
