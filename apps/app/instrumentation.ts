export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return
    if (process.env.SIGNOZ_ENABLED !== 'true' && process.env.SIGNOZ_ENABLED !== '1') return

    const endpoint = process.env.SIGNOZ_ENDPOINT || 'http://localhost:4318'
    const { registerOTel, OTLPHttpProtoTraceExporter } = await import('@vercel/otel')

    registerOTel({
        serviceName: 'poveroh-app',
        attributes: {
            'service.namespace': 'poveroh',
            'deployment.environment.name': process.env.NODE_ENV || 'development'
        },
        traceExporter: new OTLPHttpProtoTraceExporter({
            url: `${endpoint}/v1/traces`
        })
    })
}
