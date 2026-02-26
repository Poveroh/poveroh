import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { registerStatusPath } from './paths/status.path'

export const createOpenApiRegistry = () => {
    const registry = new OpenAPIRegistry()

    registerStatusPath(registry)

    return registry
}
