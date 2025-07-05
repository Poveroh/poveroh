import { IApiConfig } from '@/types/config'
import { LogLevel } from '@poveroh/types/dist'

const config: IApiConfig = {
    PORT: process.env.API_PORT || '3001',
    CDN_PORT: process.env.CDN_PORT || '3002',
    JWT_SECRET: process.env.JWT_KEY || '',
    LOG_LEVEL: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO
}

export default config
