import { IApiConfig } from '@/types/config'
import { LogLevel } from '@poveroh/types'

const config: IApiConfig = {
    // Prefer Cloud Run-provided PORT if present, then fallback to API_PORT, then default
    PORT: process.env.PORT || process.env.API_PORT || '3001',
    CDN_PORT: process.env.CDN_PORT || '3002',
    JWT_SECRET: process.env.JWT_KEY || '',
    LOG_LEVEL: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
    BASE_URL: process.env.BASE_URL,
    APP_URL: process.env.APP_URL,
    NODE_ENV: process.env.NODE_ENV || 'development',
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
