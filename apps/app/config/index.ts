import { IAppConfig } from '@/types/config'
import { LogLevel } from '@poveroh/types'

// Unique placeholder used for post-build replacements in client assets.
// The scripts/replace-variables.sh will search for this literal and swap it
// with the desired runtime value in .next/static and public assets.
const PUBLIC_API_URL_PLACEHOLDER = '__PUBLIC_API_URL__'

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
