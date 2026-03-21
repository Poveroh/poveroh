import { LogLevel } from '@poveroh/types'

export type ApiConfig = {
    PORT: string
    JWT_SECRET: string
    LOG_LEVEL: LogLevel
    BASE_URL?: string
    CDN_URL?: string
    APP_URL?: string
    NODE_ENV: string
    ALLOWED_ORIGINS: string[]
    REDIS_URL?: string
    REDIS_PASSWORD?: string
}
