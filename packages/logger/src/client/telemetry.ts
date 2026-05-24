type RegisterOptions = {
    serviceName?: string
    serviceNamespace?: string
}

/**
 * Registers OpenTelemetry instrumentation for Next.js applications, configured to export traces to a Signoz collector if enabled via environment variables.
 * @param options Optional configuration for the telemetry registration, allowing override of service name and namespace.
 * @returns A promise that resolves when telemetry registration is complete.
 */
export async function registerNextTelemetry(options: RegisterOptions = {}): Promise<void> {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return
    if (process.env.SIGNOZ_ENABLED !== 'true' && process.env.SIGNOZ_ENABLED !== '1') return

    const endpoint = process.env.SIGNOZ_ENDPOINT || 'http://localhost:4318'
    const serviceName = options.serviceName || 'poveroh-app'
    const serviceNamespace = options.serviceNamespace || 'poveroh'

    // `@vercel/otel` is imported lazily so this module stays tree-shakeable for callers
    // that may import it from environments where the dependency isn't installed.
    const { registerOTel, OTLPHttpProtoTraceExporter } = await import('@vercel/otel')

    registerOTel({
        serviceName,
        attributes: {
            'service.namespace': serviceNamespace,
            'deployment.environment.name': process.env.NODE_ENV || 'development'
        },
        traceExporter: new OTLPHttpProtoTraceExporter({
            url: `${endpoint}/v1/traces`
        })
    })
}
