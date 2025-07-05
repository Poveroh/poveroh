import { createLogger, format, transports } from 'winston'
import * as path from 'path'
import config from './environment'

const logger = createLogger({
    level: config.LOG_LEVEL,
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

if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new transports.Console({
            format: format.simple()
        })
    )
}

export default logger
