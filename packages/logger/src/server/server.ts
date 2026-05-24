import { createLogger as createWinstonLogger, format, transports, type Logger } from 'winston'
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport'
import { LogLevel } from '@poveroh/types'
import path from 'path'

const level = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO
const isProduction = process.env.NODE_ENV === 'production'
const isSignozEnabled = process.env.ENABLE_SIGNOZ === 'true' || false

export const logger: Logger = createWinstonLogger({
    level,
    format: format.combine(
        format.errors({ stack: true }),
        format.splat(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, stack }) => {
            return `${timestamp} [${level.toUpperCase()}] ${stack || message}`
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

if (isSignozEnabled) {
    logger.add(new OpenTelemetryTransportV3({ level }))
}
