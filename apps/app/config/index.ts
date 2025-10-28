import { IAppConfig } from '@/types/config'
import { LogLevel } from '@poveroh/types'

type WindowEnv = Record<string, string | undefined>

declare global {
    interface Window {
        __ENV?: WindowEnv
    }
}

const runtime: WindowEnv | null = typeof window !== 'undefined' && window.__ENV ? window.__ENV : null

const appConfig: IAppConfig = {
    name: (runtime?.NEXT_PUBLIC_APP_NAME as string) || process.env.NEXT_PUBLIC_APP_NAME || 'Poveroh',
    version: (runtime?.NEXT_PUBLIC_APP_VERSION as string) || process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0',
    apiUrl: ((runtime?.NEXT_PUBLIC_API_URL as string) || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, ''),
    mode: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === 'production',
    logLevel: ((runtime?.LOG_LEVEL as string) || process.env.LOG_LEVEL || LogLevel.INFO) as LogLevel
}

export default appConfig
