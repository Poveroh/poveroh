import { IAppConfig } from '@/types/config'
import { LogLevel } from '@poveroh/types'

const appConfig: IAppConfig = {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Poveroh',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0',
    apiUrl: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '',
    mode: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === 'production',
    logLevel: (process.env.LOG_LEVEL?.replace(/\/$/, '') as LogLevel) || LogLevel.INFO
}

export default appConfig
