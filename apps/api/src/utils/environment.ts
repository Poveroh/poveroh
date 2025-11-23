import { IApiConfig } from '@/types/config'
import { LogLevel } from '@poveroh/types'

const config: IApiConfig = {
    PORT: process.env.API_PORT || '3001',
    JWT_SECRET: process.env.JWT_KEY || '',
    LOG_LEVEL: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
    CDN_URL: process.env.CDN_URL || 'http://cdn.poveroh.local',
    BASE_URL: process.env.BASE_URL,
    APP_URL: process.env.APP_URL,
    NODE_ENV: process.env.NODE_ENV || 'development',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
    ALLOWED_ORIGINS: (() => {
        // Read comma-separated allowed origins; trim and filter empties
        const raw = process.env.ALLOWED_ORIGINS || ''
        const fromEnv = raw
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)

        // Reasonable defaults for local development
        if (!fromEnv.length && (process.env.NODE_ENV || 'development') !== 'production') {
            return ['http://localhost:3000', 'http://127.0.0.1:3000']
        }

        return fromEnv
    })()
}

export default config
