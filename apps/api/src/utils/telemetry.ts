// OpenTelemetry bootstrap for the Express API. Imported at the very top of index.ts so
// the SDK can patch core modules (http, express, pg, ioredis, ...) before they are required.
// When OTEL_EXPORTER_OTLP_ENDPOINT is missing the SDK is never started — that keeps local
// dev free of network noise for contributors who don't run Signoz.

import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { Resource } from '@opentelemetry/resources'

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT

if (endpoint) {
    const serviceName = process.env.OTEL_API_SERVICE_NAME || 'poveroh-api'
    const serviceNamespace = process.env.OTEL_SERVICE_NAMESPACE || 'poveroh'
    const environment = process.env.NODE_ENV || 'development'

    const resource = new Resource({
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
