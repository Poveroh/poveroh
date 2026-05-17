import { createLogger as createWinstonLogger, format, transports, type Logger } from 'winston'
import { LogLevel } from '@poveroh/types'
import path from 'path'

// Winston-based logger shared across server-side workspaces. Level and environment are
// resolved from process.env so the package stays decoupled from app-specific config.
const level = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO
const isProduction = process.env.NODE_ENV === 'production'

export const logger: Logger = createWinstonLogger({
    level,
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}] ${message}`
        })
    ),
    transports: [
        new transports.File({ filename: path.join('logs', 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join('logs', 'combined.log') })
    ]
})

if (!isProduction) {
    logger.add(
        new transports.Console({
            format: format.simple()
        })
    )
}
