import { registerNextTelemetry } from '@poveroh/logger/telemetry-next'

export async function register() {
    await registerNextTelemetry({ serviceName: 'poveroh-app' })
}
