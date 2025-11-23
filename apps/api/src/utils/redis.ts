import { createClient, RedisClientType } from 'redis'
import config from './environment'

let redisClient: RedisClientType | null = null

export const getRedisClient = async (): Promise<RedisClientType> => {
    if (!redisClient) {
        redisClient = createClient({
            url: config.REDIS_URL,
            password: config.REDIS_PASSWORD || undefined
        })

        redisClient.on('error', err => {
            console.error('Redis Client Error', err)
        })

        await redisClient.connect()
    }
    return redisClient
}

export const closeRedisClient = async (): Promise<void> => {
    if (redisClient) {
        await redisClient.disconnect()
        redisClient = null
    }
}
