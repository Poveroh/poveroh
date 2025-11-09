import { IAppConfig } from '@/types/config'
import { LogLevel } from '@poveroh/types'
import { env } from 'next-runtime-env'

const createAppConfig = (): IAppConfig => {
    return {
        get name(): string {
            return env('NEXT_PUBLIC_APP_NAME') || 'Poveroh'
        },
        get version(): string {
            return env('NEXT_PUBLIC_APP_VERSION') || '0.0.0'
        },
        get apiUrl(): string {
            // Use next-runtime-env to resolve at runtime (both server and client)
            return env('NEXT_PUBLIC_API_URL') || 'http://localhost:3001' || 'http://api.poveroh.local'
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
            const level = (env('NEXT_PUBLIC_LOG_LEVEL') || process.env.LOG_LEVEL || LogLevel.INFO) as LogLevel
            return level
        }
    }
}

const appConfig = createAppConfig()

export default appConfig
