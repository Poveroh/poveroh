import { LogLevel } from '@poveroh/types'

export interface IApiConfig {
    PORT: string
    CDN_PORT: string
    JWT_SECRET: string
    LOG_LEVEL: LogLevel
    BASE_URL?: string
    NODE_ENV: string
    ALLOWED_ORIGINS: string[]
}
