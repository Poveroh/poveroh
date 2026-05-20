import { createLogger as createWinstonLogger, format, transports, type Logger } from 'winston'
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport'
import { LogLevel } from '@poveroh/types'
import path from 'path'

// Winston-based logger shared across server-side workspaces. Level and environment are
// resolved from process.env so the package stays decoupled from app-specific config.
const level = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO
const isProduction = process.env.NODE_ENV === 'production'

export const logger: Logger = createWinstonLogger({
    level,
    // `format.errors({ stack: true })` turns Error instances into log entries that keep their
    // stack trace, so `logger.error(err)` forwards the stack to all transports (including OTel).
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

// Bridge Winston records to the OpenTelemetry logs SDK. When the API process has booted
// telemetry.ts, the global LoggerProvider is configured with an OTLP exporter pointing at
// Signoz; otherwise this transport becomes a no-op writer.
if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    logger.add(new OpenTelemetryTransportV3({ level }))
}
