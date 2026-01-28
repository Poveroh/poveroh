import { IAppConfig } from '@/types/config'
import { LogLevel } from '@poveroh/types'

const createAppConfig = (): IAppConfig => {
    return {
        get name(): string {
            return 'Poveroh'
        },
        get version(): string {
            return process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0'
        },
        get apiUrl(): string {
            // Public env values are available on both server and client
            return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
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
            return this.mode === 'production'
        },
        get logLevel(): LogLevel {
            // Prefer public runtime value if provided, fallback to server env
            return (process.env.NEXT_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL || LogLevel.INFO) as LogLevel
        }
    }
}

const appConfig = createAppConfig()

export default appConfig
