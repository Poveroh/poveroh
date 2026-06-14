import { createLogger as createWinstonLogger, format, transports, type Logger } from 'winston'
import TransportStream from 'winston-transport'
import DailyRotateFile from 'winston-daily-rotate-file'
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport'
import { Logtail } from '@logtail/node'
import { LogtailTransport } from '@logtail/winston'
import { LogLevel } from '@poveroh/types'
import path from 'path'

const level = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO
const isProduction = process.env.NODE_ENV === 'production'

type SentryCapture = {
    exception: (err: Error) => void
    message: (msg: string) => void
}

let _sentryCapture: SentryCapture | null = null

/**
 * Injects Sentry capture functions so the logger forwards errors to Sentry automatically.
 * Call once after Sentry.init() in the app entry point.
 * @param captureException Function to capture an Error object.
 * @param captureMessage Function to capture a plain string message.
 */
export function setSentryIntegration(
    captureException: (err: Error) => void,
    captureMessage: (msg: string) => void
): void {
    _sentryCapture = { exception: captureException, message: captureMessage }
}

class SentryTransport extends TransportStream {
    /**
     * Forwards error-level log entries to Sentry if the integration has been wired up via setSentryIntegration.
     * @param info The log entry object from Winston.
     * @param callback Called when the transport is done processing.
     */
    log(info: Record<string, unknown>, callback: () => void): void {
        setImmediate(() => this.emit('logged', info))
        if (_sentryCapture) {
            const splat = info[Symbol.for('splat') as unknown as string] as unknown[] | undefined
            const err = Array.isArray(splat) ? splat.find((s): s is Error => s instanceof Error) : null
            if (err) {
                _sentryCapture.exception(err)
            } else {
                _sentryCapture.message(String(info.message))
            }
        }
        callback()
    }
}

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
        new DailyRotateFile({
            filename: path.join('logs', 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '30d'
        }),
        new DailyRotateFile({
            filename: path.join('logs', 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d'
        }),
        new SentryTransport({ level: 'error' })
    ]
})

logger.add(new transports.Console(isProduction ? {} : { format: format.simple() }))

const betterStackToken = process.env.BETTERSTACK_SOURCE_TOKEN
if (betterStackToken) {
    const logtail = new Logtail(betterStackToken)
    logger.add(new LogtailTransport(logtail))
}

const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
if (otelEndpoint) {
    logger.add(new OpenTelemetryTransportV3({ level }))
}
