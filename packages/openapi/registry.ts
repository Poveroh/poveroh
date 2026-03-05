import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import * as schemas from './schemas'
import { registerStatusPath } from './paths/status.path'
import { registerUserPath } from './paths/user.path'
import { registerTransactionPath } from './paths/transaction.path'
import { registerFinancialAccountPath } from './paths/financial-account.path'
import { registerCategoryPath } from './paths/category.path'
import { registerSubcategoryPath } from './paths/subcategory.path'
import { registerSnapshotPath } from './paths/snapshot.path'
import { registerSessionPath } from './paths/session.path'
import { registerSubscriptionPath } from './paths/subscription.path'

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
    registerStatusPath(registry)
    registerUserPath(registry)
    registerTransactionPath(registry)
    registerFinancialAccountPath(registry)
    registerSubscriptionPath(registry)
    registerCategoryPath(registry)
    registerSubcategoryPath(registry)
    registerSnapshotPath(registry)
    registerSessionPath(registry)
}

export const createOpenApiRegistry = () => {
    const registry = new OpenAPIRegistry()
    registerAllSchemas(registry)
    registerAllPaths(registry)
    return registry
}
