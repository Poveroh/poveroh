// Next.js 16 instrumentation hook. Runs once per server process before the app boots.
// Wires the Vercel OTel helper to send traces/metrics to the Signoz OTel collector
// when OTEL_EXPORTER_OTLP_ENDPOINT is configured. Edge runtime is skipped — OTel SDK
// needs Node primitives that don't exist on the edge.

export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return
    if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return

    const { registerOTel, OTLPHttpProtoTraceExporter } = await import('@vercel/otel')

    registerOTel({
        serviceName: process.env.OTEL_APP_SERVICE_NAME || 'poveroh-app',
        attributes: {
            'service.namespace': process.env.OTEL_SERVICE_NAMESPACE || 'poveroh',
            'deployment.environment.name': process.env.NODE_ENV || 'development'
        },
        traceExporter: new OTLPHttpProtoTraceExporter({
            url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`
        })
    })
}
