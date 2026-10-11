export const PUBLIC_RUNTIME_ENV_KEYS = [
    'NEXT_PUBLIC_APP_VERSION',
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_LOG_LEVEL'
] as const

export type PublicRuntimeEnvKey = (typeof PUBLIC_RUNTIME_ENV_KEYS)[number]

export type PublicRuntimeEnv = Partial<Record<PublicRuntimeEnvKey, string>>
