import { IAppConfig } from '@/types/config'
import { LogLevel } from '@poveroh/types'

type WindowEnv = Record<string, string | undefined>

declare global {
    interface Window {
        __ENV?: WindowEnv
    }
}

const getRuntimeConfig = (): WindowEnv | null => {
    if (typeof window !== 'undefined') {
        if (window.__ENV) {
            return window.__ENV
        } else {
            console.log('⚠️ window.__ENV not available, using process.env fallback')
        }
    }
    return null
}

const createAppConfig = (): IAppConfig => {
    return {
        get name(): string {
            const runtime = getRuntimeConfig()
            return (runtime?.NEXT_PUBLIC_APP_NAME as string) || process.env.NEXT_PUBLIC_APP_NAME || 'Poveroh'
        },
        get version(): string {
            const runtime = getRuntimeConfig()
            return (runtime?.NEXT_PUBLIC_APP_VERSION as string) || process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0'
        },
        get apiUrl(): string {
            const runtime = getRuntimeConfig()
            return ((runtime?.NEXT_PUBLIC_API_URL as string) || process.env.NEXT_PUBLIC_API_URL || '').replace(
                /\/$/,
                ''
            )
        },
        get mode(): 'production' | 'development' | 'test' {
            return (process.env.NODE_ENV as 'production' | 'development' | 'test') || 'development'
        },
        get isProduction(): boolean {
            return process.env.NODE_ENV === 'production'
        },
        get logLevel(): LogLevel {
            const runtime = getRuntimeConfig()
            return ((runtime?.LOG_LEVEL as string) || process.env.LOG_LEVEL || LogLevel.INFO) as LogLevel
        }
    }
}

const appConfig = createAppConfig()

export default appConfig
