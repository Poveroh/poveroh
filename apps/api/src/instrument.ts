import * as Sentry from '@sentry/node'
import { setSentryIntegration } from '@poveroh/logger/server'

const dsn = process.env.SENTRY_DSN

if (dsn) {
    Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 1.0
    })

    setSentryIntegration(
        err => Sentry.captureException(err),
        msg => Sentry.captureMessage(msg, 'error')
    )
}
