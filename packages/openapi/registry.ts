import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { registerStatusPath } from './paths/status.path'
import { registerUserPath } from './paths/user.path'
import { registerTransactionPath } from './paths/transaction.path'
import { registerAccountPath } from './paths/account.path'
import { registerCategoryPath } from './paths/category.path'
import { registerSubcategoryPath } from './paths/subcategory.path'
import { registerSnapshotPath } from './paths/snapshot.path'
import { registerSessionPath } from './paths/session.path'

export const registerAllPaths = (registry: OpenAPIRegistry) => {
    registerStatusPath(registry)
    registerUserPath(registry)
    registerTransactionPath(registry)
    registerAccountPath(registry)
    registerCategoryPath(registry)
    registerSubcategoryPath(registry)
    registerSnapshotPath(registry)
    registerSessionPath(registry)
}

export const createOpenApiRegistry = () => {
    const registry = new OpenAPIRegistry()
    registerAllPaths(registry)
    return registry
}
