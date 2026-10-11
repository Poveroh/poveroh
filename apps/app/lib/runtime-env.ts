import { PUBLIC_RUNTIME_ENV_KEYS } from '@poveroh/types'
import type { PublicRuntimeEnv, PublicRuntimeEnvKey } from '@poveroh/types'

/**
 * Reads a public env variable at runtime: from the server process, or from the values injected into `window.__ENV` in the browser.
 * Lets one Docker image serve different deployments without rebuilding, unlike build-time `process.env.NEXT_PUBLIC_*` inlining.
 * @param key The public env variable to read.
 * @returns The variable value, or undefined when it is not set.
 */
export const getRuntimeEnv = (key: PublicRuntimeEnvKey): string | undefined => {
    if (typeof window !== 'undefined') return window.__ENV?.[key]
    return process.env[key]
}

/**
 * Collects the allowlisted public env variables from the server process, to be injected into the browser.
 * @returns The public env values that are set.
 */
export const getPublicRuntimeEnv = (): PublicRuntimeEnv =>
    Object.fromEntries(
        PUBLIC_RUNTIME_ENV_KEYS.filter(key => process.env[key] !== undefined).map(key => [key, process.env[key]])
    )

/**
 * Serializes the public env into an inline script assigning `window.__ENV`, escaping `<` so a value cannot close the script tag.
 * @param env The public env values to serialize.
 * @returns The inline script source.
 */
export const serializePublicRuntimeEnv = (env: PublicRuntimeEnv): string =>
    `window.__ENV=${JSON.stringify(env).replace(/</g, '\\u003c')}`
