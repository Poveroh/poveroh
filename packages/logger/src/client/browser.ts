import { LogLevel } from '@poveroh/types'
import type { Logger } from '../index.js'

const colorMap: Record<LogLevel, string> = {
    [LogLevel.INFO]: 'color: blue',
    [LogLevel.WARN]: 'color: orange',
    [LogLevel.ERROR]: 'color: red',
    [LogLevel.DEBUG]: 'color: gray'
}

const levelPriority: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 10,
    [LogLevel.INFO]: 20,
    [LogLevel.WARN]: 30,
    [LogLevel.ERROR]: 40
}

// Resolve the active log level from public env values so client bundles can be tuned
// independently from the API. Falls back to INFO when nothing is configured.
const resolveLevel = (): LogLevel => {
    const fromEnv =
        (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_LOG_LEVEL || process.env?.LOG_LEVEL)) || undefined
    return (fromEnv as LogLevel) || LogLevel.INFO
}

const formatMessage = (level: LogLevel, ...args: unknown[]) => {
    const time = new Date().toLocaleTimeString()
    const label = `%c[${time}] ${level.toUpperCase()}:`
    return [label, colorMap[level], ...args]
}

const activeLevel = resolveLevel()
const shouldLog = (level: LogLevel) => levelPriority[level] >= levelPriority[activeLevel]

type SentryCapture = {
    captureException: (err: Error) => void
    captureMessage: (msg: string) => void
}

let _sentry: SentryCapture | null = null

/**
 * Injects Sentry capture functions for browser error reporting.
 * Call once after Sentry.init() in your client-side Sentry config file.
 * @param captureException Function to capture an Error object.
 * @param captureMessage Function to capture a plain string message.
 */
export function setSentryIntegration(
    captureException: (err: Error) => void,
    captureMessage: (msg: string) => void
): void {
    _sentry = { captureException, captureMessage }
}

// BetterStack browser logger — initialized lazily to avoid SSR crashes (@logtail/browser is browser-only).
type LogtailBrowser = {
    info: (msg: string) => void
    warn: (msg: string) => void
    error: (msg: string) => void
    debug: (msg: string) => void
}
let _logtail: LogtailBrowser | null = null

const betterStackToken = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_BETTERSTACK_SOURCE_TOKEN || '' : ''

if (betterStackToken && typeof window !== 'undefined') {
    import('@logtail/browser')
        .then(({ Logtail }) => {
            _logtail = new Logtail(betterStackToken) as LogtailBrowser
        })
        .catch(() => {
            // BetterStack unavailable, continue without it
        })
}

// Console-based logger safe for client bundles (no Node-only dependencies). The active
// log level gates which calls reach the console, matching the server logger's behaviour.
export const logger: Logger = {
    debug: (...args: unknown[]) => {
        if (!shouldLog(LogLevel.DEBUG)) return
        console.debug(...formatMessage(LogLevel.DEBUG, ...args))
        _logtail?.debug(String(args[0]))
    },
    info: (...args: unknown[]) => {
        if (!shouldLog(LogLevel.INFO)) return
        console.info(...formatMessage(LogLevel.INFO, ...args))
        _logtail?.info(String(args[0]))
    },
    warn: (...args: unknown[]) => {
        if (!shouldLog(LogLevel.WARN)) return
        console.warn(...formatMessage(LogLevel.WARN, ...args))
        _logtail?.warn(String(args[0]))
    },
    error: (...args: unknown[]) => {
        if (!shouldLog(LogLevel.ERROR)) return
        console.error(...formatMessage(LogLevel.ERROR, ...args))
        _logtail?.error(String(args[0]))
        if (_sentry) {
            const err = args.find((a): a is Error => a instanceof Error)
            if (err) _sentry.captureException(err)
            else _sentry.captureMessage(String(args[0]))
        }
    }
}

export default logger
