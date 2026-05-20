import { DEFAULT_TTL_SECONDS } from '@poveroh/types'
import { getRedisClient } from './client.js'

export const RedisHelper = {
    async get(key: string): Promise<string | null> {
        try {
            return await getRedisClient().get(key)
        } catch (error) {
            console.error(`Redis GET error for key ${key}:`, error)
            return null
        }
    },

    async set(key: string, value: string, ttl?: number): Promise<boolean> {
        try {
            const client = getRedisClient()
            const expiration = ttl !== undefined ? ttl : DEFAULT_TTL_SECONDS
            if (expiration > 0) {
                await client.setEx(key, expiration, value)
            } else {
                await client.set(key, value)
            }
            return true
        } catch (error) {
            console.error(`Redis SET error for key ${key}:`, error)
            return false
        }
    },

    async setJson<T>(key: string, value: T, ttl?: number): Promise<boolean> {
        try {
            return await this.set(key, JSON.stringify(value), ttl)
        } catch (error) {
            console.error(`Redis SET JSON error for key ${key}:`, error)
            return false
        }
    },

    async getJson<T>(key: string): Promise<T | null> {
        try {
            const value = await this.get(key)
            if (!value) return null
            return JSON.parse(value) as T
        } catch (error) {
            console.error(`Redis GET JSON error for key ${key}:`, error)
            return null
        }
    },

    async delete(key: string): Promise<boolean> {
        try {
            await getRedisClient().del(key)
            return true
        } catch (error) {
            console.error(`Redis DELETE error for key ${key}:`, error)
            return false
        }
    },

    async exists(key: string): Promise<boolean> {
        try {
            return (await getRedisClient().exists(key)) === 1
        } catch (error) {
            console.error(`Redis EXISTS error for key ${key}:`, error)
            return false
        }
    },

    async expire(key: string, ttl: number): Promise<boolean> {
        try {
            await getRedisClient().expire(key, ttl)
            return true
        } catch (error) {
            console.error(`Redis EXPIRE error for key ${key}:`, error)
            return false
        }
    },

    async incr(key: string): Promise<number | null> {
        try {
            return await getRedisClient().incr(key)
        } catch (error) {
            console.error(`Redis INCR error for key ${key}:`, error)
            return null
        }
    },

    async hget(hash: string, field: string): Promise<string | null> {
        try {
            return await getRedisClient().hGet(hash, field)
        } catch (error) {
            console.error(`Redis HGET error for hash ${hash}, field ${field}:`, error)
            return null
        }
    },

    async hset(hash: string, field: string, value: string): Promise<boolean> {
        try {
            await getRedisClient().hSet(hash, field, value)
            return true
        } catch (error) {
            console.error(`Redis HSET error for hash ${hash}, field ${field}:`, error)
            return false
        }
    },

    async hdel(hash: string, field: string): Promise<boolean> {
        try {
            await getRedisClient().hDel(hash, field)
            return true
        } catch (error) {
            console.error(`Redis HDEL error for hash ${hash}, field ${field}:`, error)
            return false
        }
    }
}
