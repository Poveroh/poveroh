import { IAppConfig } from '@/types/config'
import { LogLevel } from '@poveroh/types'

const createAppConfig = (): IAppConfig => {
    return {
        get name(): string {
            return process.env.NEXT_PUBLIC_APP_NAME || 'Poveroh'
        },
        get version(): string {
            return process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0'
        },
        get apiUrl(): string {
            return (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
        },
        get mode(): 'production' | 'development' | 'test' {
            // For client-side code, we can't access NODE_ENV at runtime,
            // so we default to production in client builds
            if (typeof window !== 'undefined') {
                return 'production'
            }
            return (process.env.NODE_ENV as 'production' | 'development' | 'test') || 'development'
        },
        get isProduction(): boolean {
            // For client-side code, we can't access NODE_ENV at runtime,
            // so we default to true in client builds
            if (typeof window !== 'undefined') {
                return true
            }
            return process.env.NODE_ENV === 'production'
        },
        get logLevel(): LogLevel {
            return (process.env.NEXT_PUBLIC_LOG_LEVEL || LogLevel.INFO) as LogLevel
        }
    }
}

const appConfig = createAppConfig()

export default appConfig
