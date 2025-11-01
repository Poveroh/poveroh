import { IAppConfig } from '@/types/config'
import { LogLevel } from '@poveroh/types'

// Placeholder aligned with Docker replacement script
// See scripts/docker-app-setup.sh and scripts/replace-variables.sh
const PUBLIC_API_URL_PLACEHOLDER = 'BAKED_NEXT_PUBLIC_API_URL'

const createAppConfig = (): IAppConfig => {
    return {
        get name(): string {
            return process.env.NEXT_PUBLIC_APP_NAME || 'Poveroh'
        },
        get version(): string {
            return process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0'
        },
        get apiUrl(): string {
            // For client bundles, NEXT_PUBLIC_* vars are inlined at build time.
            // If it's not set during build, we keep a unique placeholder so
            // scripts/replace-variables.sh can replace it at deploy/runtime.
            return process.env.NEXT_PUBLIC_API_URL || PUBLIC_API_URL_PLACEHOLDER
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
            return (process.env.LOG_LEVEL || LogLevel.INFO) as LogLevel
        }
    }
}

const appConfig = createAppConfig()

export default appConfig
