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

// Console-based logger safe for client bundles (no Node-only dependencies). The active
// log level gates which calls reach the console, matching the server logger's behaviour.
const activeLevel = resolveLevel()
const shouldLog = (level: LogLevel) => levelPriority[level] >= levelPriority[activeLevel]

export const logger: Logger = {
    debug: (...args: unknown[]) => {
        if (shouldLog(LogLevel.DEBUG)) console.debug(...formatMessage(LogLevel.DEBUG, ...args))
    },
    info: (...args: unknown[]) => {
        if (shouldLog(LogLevel.INFO)) console.info(...formatMessage(LogLevel.INFO, ...args))
    },
    warn: (...args: unknown[]) => {
        if (shouldLog(LogLevel.WARN)) console.warn(...formatMessage(LogLevel.WARN, ...args))
    },
    error: (...args: unknown[]) => {
        if (shouldLog(LogLevel.ERROR)) console.error(...formatMessage(LogLevel.ERROR, ...args))
    }
}

export default logger
