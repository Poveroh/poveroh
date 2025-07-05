import appConfig from '@/config'
import { LogLevel } from '@poveroh/types'

const colorMap: Record<LogLevel, string> = {
    info: 'color: blue',
    warn: 'color: orange',
    error: 'color: red',
    debug: 'color: gray'
}

const formatMessage = (level: LogLevel, ...args: unknown[]) => {
    const time = new Date().toLocaleTimeString()
    const label = `%c[${time}] ${level.toUpperCase()}:`
    return [label, colorMap[level], ...args]
}

export interface Logger {
    info: (...args: unknown[]) => void
    warn: (...args: unknown[]) => void
    error: (...args: unknown[]) => void
    debug: (...args: unknown[]) => void
}

const logger = {
    info: (...args: unknown[]) => {
        console.info(...formatMessage(LogLevel.INFO, ...args))
    },
    warn: (...args: unknown[]) => {
        console.warn(...formatMessage(LogLevel.WARN, ...args))
    },
    error: (...args: unknown[]) => {
        console.error(...formatMessage(LogLevel.ERROR, ...args))
    },
    debug: (...args: unknown[]) => {
        if (!appConfig.isProduction) console.debug(...formatMessage(LogLevel.DEBUG, ...args))
    }
}

export default logger
