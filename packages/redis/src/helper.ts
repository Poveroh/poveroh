import { DEFAULT_TTL_SECONDS } from '@poveroh/types'
import { getRedisClient } from './client.js'

export class RedisHelper {
    /**
     * Retrieves the string value stored at the given key.
     * @param key The Redis key to read.
     * @returns The stored value, or null if missing or on error.
     */
    async get(key: string): Promise<string | null> {
        try {
            return await getRedisClient().get(key)
        } catch (error) {
            console.error(`Redis GET error for key ${key}:`, error)
            return null
        }
    }

    /**
     * Stores a string value at the given key, applying a TTL when positive.
     * @param key The Redis key to write.
     * @param value The string value to store.
     * @param ttl Optional expiration in seconds; defaults to DEFAULT_TTL_SECONDS, no expiration when <= 0.
     * @returns True when the value was stored, false on error.
     */
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
    }

    /**
     * Serializes a value to JSON and stores it at the given key.
     * @param key The Redis key to write.
     * @param value The value to serialize and store.
     * @param ttl Optional expiration in seconds.
     * @returns True when the value was stored, false on error.
     */
    async setJson<T>(key: string, value: T, ttl?: number): Promise<boolean> {
        try {
            return await this.set(key, JSON.stringify(value), ttl)
        } catch (error) {
            console.error(`Redis SET JSON error for key ${key}:`, error)
            return false
        }
    }

    /**
     * Reads and deserializes a JSON value stored at the given key.
     * @param key The Redis key to read.
     * @returns The parsed value, or null if missing or on error.
     */
    async getJson<T>(key: string): Promise<T | null> {
        try {
            const value = await this.get(key)
            if (!value) return null
            return JSON.parse(value) as T
        } catch (error) {
            console.error(`Redis GET JSON error for key ${key}:`, error)
            return null
        }
    }

    /**
     * Deletes the given key.
     * @param key The Redis key to delete.
     * @returns True when the delete was issued, false on error.
     */
    async delete(key: string): Promise<boolean> {
        try {
            await getRedisClient().del(key)
            return true
        } catch (error) {
            console.error(`Redis DELETE error for key ${key}:`, error)
            return false
        }
    }

    /**
     * Checks whether the given key exists.
     * @param key The Redis key to check.
     * @returns True when the key exists, false when missing or on error.
     */
    async exists(key: string): Promise<boolean> {
        try {
            return (await getRedisClient().exists(key)) === 1
        } catch (error) {
            console.error(`Redis EXISTS error for key ${key}:`, error)
            return false
        }
    }

    /**
     * Sets an expiration on the given key.
     * @param key The Redis key to expire.
     * @param ttl Expiration in seconds.
     * @returns True when the expiration was set, false on error.
     */
    async expire(key: string, ttl: number): Promise<boolean> {
        try {
            await getRedisClient().expire(key, ttl)
            return true
        } catch (error) {
            console.error(`Redis EXPIRE error for key ${key}:`, error)
            return false
        }
    }

    /**
     * Atomically increments the integer value stored at the given key.
     * @param key The Redis key to increment.
     * @returns The new value, or null on error.
     */
    async incr(key: string): Promise<number | null> {
        try {
            return await getRedisClient().incr(key)
        } catch (error) {
            console.error(`Redis INCR error for key ${key}:`, error)
            return null
        }
    }

    /**
     * Reads a single field from a hash.
     * @param hash The hash key.
     * @param field The field within the hash.
     * @returns The field value, or null if missing or on error.
     */
    async hget(hash: string, field: string): Promise<string | null> {
        try {
            return await getRedisClient().hGet(hash, field)
        } catch (error) {
            console.error(`Redis HGET error for hash ${hash}, field ${field}:`, error)
            return null
        }
    }

    /**
     * Writes a single field into a hash.
     * @param hash The hash key.
     * @param field The field within the hash.
     * @param value The value to store.
     * @returns True when the field was written, false on error.
     */
    async hset(hash: string, field: string, value: string): Promise<boolean> {
        try {
            await getRedisClient().hSet(hash, field, value)
            return true
        } catch (error) {
            console.error(`Redis HSET error for hash ${hash}, field ${field}:`, error)
            return false
        }
    }

    /**
     * Deletes a single field from a hash.
     * @param hash The hash key.
     * @param field The field within the hash.
     * @returns True when the delete was issued, false on error.
     */
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
