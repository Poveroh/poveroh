import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { resourceFromAttributes } from '@opentelemetry/resources'

const isSignozEnabled = process.env.SIGNOZ_ENABLED === 'true' || process.env.SIGNOZ_ENABLED === '1'

if (isSignozEnabled) {
    const endpoint = process.env.SIGNOZ_ENDPOINT || 'http://localhost:4318'
    // `OTEL_SERVICE_NAME` is the standard OpenTelemetry env knob; we honour it so different
    // Node services (api, worker, ...) sharing this entrypoint can report distinct names.
    const serviceName = 'poveroh-api'
    const serviceNamespace = 'poveroh'
    const environment = process.env.NODE_ENV || 'development'

    const resource = resourceFromAttributes({
        'service.name': serviceName,
        'service.namespace': serviceNamespace,
        'service.version': process.env.npm_package_version || '0.0.0',
        'deployment.environment.name': environment
    })

    const sdk = new NodeSDK({
        resource,
        traceExporter: new OTLPTraceExporter({ url: `${endpoint}/v1/traces` }),
        metricReader: new PeriodicExportingMetricReader({
            exporter: new OTLPMetricExporter({ url: `${endpoint}/v1/metrics` }),
            exportIntervalMillis: 60_000
        }),
        logRecordProcessors: [new BatchLogRecordProcessor(new OTLPLogExporter({ url: `${endpoint}/v1/logs` }))],
        instrumentations: [getNodeAutoInstrumentations()]
    })

    sdk.start()

    // Flush spans/metrics/logs on shutdown so the last batch reaches the collector.
    const shutdown = async () => {
        try {
            await sdk.shutdown()
        } catch (err) {
            console.error('Error shutting down OpenTelemetry SDK', err)
        } finally {
            process.exit(0)
        }
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)

    console.log(`📡 OpenTelemetry SDK started (service=${serviceName}, endpoint=${endpoint})`)
}
