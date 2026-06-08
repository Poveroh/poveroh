type RegisterOptions = {
    serviceName?: string
    serviceNamespace?: string
}

/**
 * Registers OpenTelemetry instrumentation for Next.js applications, configured to export traces,
 * metrics, and host metrics (CPU, memory, network, process) to any OTLP-compatible collector
 * when NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT is set.
 * @param options Optional configuration for the telemetry registration, allowing override of service name and namespace.
 * @returns A promise that resolves when telemetry registration is complete.
 */
export async function registerNextTelemetry(options: RegisterOptions = {}): Promise<void> {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return
    const endpoint = process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT
    if (!endpoint) return

    const serviceName = options.serviceName || 'poveroh-app'
    const serviceNamespace = options.serviceNamespace || 'poveroh'

    // Heavy OpenTelemetry dependencies are imported lazily so this module stays tree-shakeable
    // for callers that may import it from environments where they aren't installed (e.g. the
    // edge runtime, which already bails out at the guard above).
    const { registerOTel, OTLPHttpProtoTraceExporter } = await import('@vercel/otel')

    // `@vercel/otel` handles only traces. Metrics use a self-contained pipeline built from the
    // workspace `@opentelemetry/sdk-metrics`: feeding an externally-built metric reader into
    // `@vercel/otel`'s own bundled metrics SDK crashes with `createAggregator is not a function`
    // because the two sides resolve to incompatible sdk-metrics versions.
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

    const { MeterProvider, PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics')
    const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-http')
    const { resourceFromAttributes } = await import('@opentelemetry/resources')
    const { HostMetrics } = await import('@opentelemetry/host-metrics')

    // Dedicated meter provider for host-level metrics (CPU, memory, network, process), mirroring
    // the API service's pipeline so the whole metrics stack stays on one consistent SDK version.
    const meterProvider = new MeterProvider({
        resource: resourceFromAttributes({
            'service.name': serviceName,
            'service.namespace': serviceNamespace,
            'deployment.environment.name': process.env.NODE_ENV || 'development'
        }),
        readers: [
            new PeriodicExportingMetricReader({
                exporter: new OTLPMetricExporter({ url: `${endpoint}/v1/metrics` }),
                exportIntervalMillis: 60_000
            })
        ]
    })

    const hostMetrics = new HostMetrics({
        meterProvider,
        name: `${serviceName}-host-metrics`
    })
    hostMetrics.start()
}
