import { RedisConnectionConfig } from '@poveroh/types'
import { createClient, type RedisClientType } from 'redis'

let redisClient: RedisClientType | null = null

/**
 * Initializes and returns a Redis client instance. If the client is already initialized, it returns the existing instance.
 * @param config - The configuration object containing the Redis connection URL and optional password.
 * @returns A promise that resolves to the initialized Redis client instance.
 */
export const createRedisClient = async (config: RedisConnectionConfig): Promise<RedisClientType> => {
    if (redisClient) return redisClient

    redisClient = createClient({
        url: config.url,
        password: config.password
    })

    redisClient.on('error', err => {
        console.error('Redis Client Error', err)
    })

    await redisClient.connect()
    return redisClient
}

/**
 * Retrieves the existing Redis client instance. If the client has not been initialized, it throws an error.
 * @returns The existing Redis client instance.
 * @throws An error if the Redis client has not been initialized.
 * Note: Ensure that createRedisClient(config) is called at startup to initialize the client before calling this function.
 */
export const getRedisClient = (): RedisClientType => {
    if (!redisClient) {
        throw new Error('Redis client not initialized. Call createRedisClient(config) at startup.')
    }
    return redisClient
}

/**
 * Closes the Redis client connection and resets the client instance to null. This should be called during application shutdown to gracefully close the connection.
 */
export const closeRedisClient = async (): Promise<void> => {
    if (redisClient) {
        await redisClient.destroy()
        redisClient = null
    }
}
