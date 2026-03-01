import { LogLevel } from '@poveroh/types'

export type AppConfig = {
    name: string
    version: string
    apiUrl: string
    mode: 'production' | 'development' | 'test'
    isProduction: boolean
    logLevel: LogLevel
}
