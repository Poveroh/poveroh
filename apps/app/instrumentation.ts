export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await import('./sentry.server.config')
    }
    const { registerNextTelemetry } = await import('@poveroh/logger/telemetry-next')
    await registerNextTelemetry({ serviceName: 'poveroh-app' })
}
