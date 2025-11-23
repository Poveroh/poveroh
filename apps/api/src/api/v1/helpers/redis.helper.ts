import { getRedisClient } from '../../../utils/redis'

export const RedisHelper = {
    async get(key: string): Promise<string | null> {
        try {
            const client = await getRedisClient()
            return await client.get(key)
        } catch (error) {
            console.error(`Redis GET error for key ${key}:`, error)
            return null
        }
    },
    async set(key: string, value: string, ttl?: number): Promise<boolean> {
        try {
            const client = await getRedisClient()
            if (ttl) {
                await client.setEx(key, ttl, value)
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
            const jsonValue = JSON.stringify(value)
            return await this.set(key, jsonValue, ttl)
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
            const client = await getRedisClient()
            await client.del(key)
            return true
        } catch (error) {
            console.error(`Redis DELETE error for key ${key}:`, error)
            return false
        }
    },
    async exists(key: string): Promise<boolean> {
        try {
            const client = await getRedisClient()
            const result = await client.exists(key)
            return result === 1
        } catch (error) {
            console.error(`Redis EXISTS error for key ${key}:`, error)
            return false
        }
    },
    async expire(key: string, ttl: number): Promise<boolean> {
        try {
            const client = await getRedisClient()
            await client.expire(key, ttl)
            return true
        } catch (error) {
            console.error(`Redis EXPIRE error for key ${key}:`, error)
            return false
        }
    },
    async incr(key: string): Promise<number | null> {
        try {
            const client = await getRedisClient()
            return await client.incr(key)
        } catch (error) {
            console.error(`Redis INCR error for key ${key}:`, error)
            return null
        }
    },
    async hget(hash: string, field: string): Promise<string | null> {
        try {
            const client = await getRedisClient()
            return await client.hGet(hash, field)
        } catch (error) {
            console.error(`Redis HGET error for hash ${hash}, field ${field}:`, error)
            return null
        }
    },
    async hset(hash: string, field: string, value: string): Promise<boolean> {
        try {
            const client = await getRedisClient()
            await client.hSet(hash, field, value)
            return true
        } catch (error) {
            console.error(`Redis HSET error for hash ${hash}, field ${field}:`, error)
            return false
        }
    },
    async hdel(hash: string, field: string): Promise<boolean> {
        try {
            const client = await getRedisClient()
            await client.hDel(hash, field)
            return true
        } catch (error) {
            console.error(`Redis HDEL error for hash ${hash}, field ${field}:`, error)
            return false
        }
    }
}
