import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
// Force-import all schemas so their `.openapi()` calls register definitions
import './schemas/account.schema'
import './schemas/category.schema'
import './schemas/dashboard.schema'
import './schemas/enum.schema'
import './schemas/error.schema'
import './schemas/import.schema'
import './schemas/report.schema'
import './schemas/session.schema'
import './schemas/snapshot.schema'
import './schemas/status.schema'
import './schemas/subcategory.schema'
import './schemas/subscription.schema'
import './schemas/transaction.schema'
import './schemas/user.schema'
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
