import { OpenAPIRegistry, zodToOpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import * as schemas from './schemas'
import {
    registerCategoryPath,
    registerDashboardPath,
    registerFinancialAccountPath,
    registerImportPath,
    registerReportPath,
    registerSnapshotPath,
    registerStatusPath,
    registerSubcategoryPath,
    registerSubscriptionPath,
    registerTransactionPath,
    registerUserPath
} from './paths'

const isZodSchema = (value: unknown): boolean => {
    return typeof value === 'object' && value !== null && typeof value !== 'function' && '_def' in value
}

const registerAllSchemas = (registry: OpenAPIRegistry) => {
    for (const schema of Object.values(schemas) as any[]) {
        if (!isZodSchema(schema)) {
            continue
        }

        const refId = zodToOpenAPIRegistry.get(schema)?._internal?.refId
        if (!refId) {
            continue
        }

        registry.register(refId, schema)
    }
}

export const registerAllPaths = (registry: OpenAPIRegistry) => {
    registerStatusPath(registry)
    registerUserPath(registry)
    registerCategoryPath(registry)
    registerSubcategoryPath(registry)
    registerTransactionPath(registry)
    registerSubscriptionPath(registry)
    registerFinancialAccountPath(registry)
    registerImportPath(registry)
    registerDashboardPath(registry)
    registerSnapshotPath(registry)
    registerReportPath(registry)
}

export const createOpenApiRegistry = () => {
    const registry = new OpenAPIRegistry()
    registerAllSchemas(registry)
    registerAllPaths(registry)
    return registry
}
