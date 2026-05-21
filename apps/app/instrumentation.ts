export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return
    if (!process.env.SIGNOZ_ENDPOINT) return

    const { registerOTel, OTLPHttpProtoTraceExporter } = await import('@vercel/otel')

    registerOTel({
        serviceName: 'poveroh-app',
        attributes: {
            'service.namespace': 'poveroh',
            'deployment.environment.name': process.env.NODE_ENV || 'development'
        },
        traceExporter: new OTLPHttpProtoTraceExporter({
            url: `${process.env.SIGNOZ_ENDPOINT}/v1/traces`
        })
    })
}
