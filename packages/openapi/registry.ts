import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
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

type OpenApiAwareSchema = {
    _def?: {
        openapi?: {
            _internal?: {
                refId?: string
            }
        }
    }
}

const isOpenApiAwareSchema = (value: unknown): value is OpenApiAwareSchema => {
    return typeof value === 'object' && value !== null && typeof value !== 'function' && '_def' in value
}

const registerAllSchemas = (registry: OpenAPIRegistry) => {
    for (const [exportName, schema] of Object.entries(schemas)) {
        if (!isOpenApiAwareSchema(schema)) {
            continue
        }

        const schemaName = schema._def?.openapi?._internal?.refId ?? exportName
        registry.register(schemaName, schema as any)
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
