import type { BullMQConnectionOptions, RedisConnectionConfig } from '@poveroh/types'

export function createBullMQConnectionOptions(config: RedisConnectionConfig): BullMQConnectionOptions {
    const redisUrl = new URL(config.url)

    return {
        host: redisUrl.hostname,
        port: Number(redisUrl.port || 6379),
        username: redisUrl.username || undefined,
        password: config.password || redisUrl.password || undefined,
        db: redisUrl.pathname ? Number(redisUrl.pathname.replace('/', '') || 0) : undefined
    }
}
