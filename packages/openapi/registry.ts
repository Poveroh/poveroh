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
    return typeof value === 'object' && value !== null && '_def' in value
}

const registerAllSchemas = (registry: OpenAPIRegistry) => {
    for (const [exportName, schema] of Object.entries(schemas)) {
        if (!isOpenApiAwareSchema(schema)) {
            continue
        }

        const schemaName = schema._def?.openapi?._internal?.refId ?? exportName
        registry.register(schemaName, schema)
    }
}

export const registerAllPaths = (registry: OpenAPIRegistry) => {
    registerCategoryPath(registry)
    registerDashboardPath(registry)
    registerFinancialAccountPath(registry)
    registerImportPath(registry)
    registerReportPath(registry)
    registerSnapshotPath(registry)
    registerStatusPath(registry)
    registerSubcategoryPath(registry)
    registerSubscriptionPath(registry)
    registerTransactionPath(registry)
    registerUserPath(registry)
}

export const createOpenApiRegistry = () => {
    const registry = new OpenAPIRegistry()
    registerAllSchemas(registry)
    registerAllPaths(registry)
    return registry
}
