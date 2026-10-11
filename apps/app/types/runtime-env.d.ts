import type { PublicRuntimeEnv } from '@poveroh/types'

declare global {
    interface Window {
        __ENV?: PublicRuntimeEnv
    }
}
