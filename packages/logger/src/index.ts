export { LogLevel } from '@poveroh/types'

// Shared logger contract. Both the server (Winston) and browser (console) entry-points
// satisfy this interface so consumers can depend on it without picking a runtime.
export interface Logger {
    debug: (...args: unknown[]) => void
    info: (...args: unknown[]) => void
    warn: (...args: unknown[]) => void
    error: (...args: unknown[]) => void
}
