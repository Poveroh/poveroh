import { LogLevel } from '@poveroh/types'

export interface IAppConfig {
    name: string
    version: string
    apiUrl: string
    mode: 'production' | 'development' | 'test'
    isProduction: boolean
    logLevel: LogLevel
}
