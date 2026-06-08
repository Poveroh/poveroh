import * as Sentry from '@sentry/nextjs'
import { setSentryIntegration } from '@poveroh/logger/browser'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
    Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 1.0,
        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        integrations: [Sentry.replayIntegration()]
    })

    setSentryIntegration(
        err => Sentry.captureException(err),
        msg => Sentry.captureMessage(msg, 'error')
    )
}
