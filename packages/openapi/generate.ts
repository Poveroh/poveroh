import fs from 'fs'
import path from 'path'
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { createOpenApiRegistry } from './registry'

type OpenApiDocument = {
    openapi?: string
    info?: {
        title?: string
        version?: string
        description?: string
    }
    servers?: Array<{ url: string; description?: string }>
    tags?: Array<{ name: string; description?: string }>
    paths?: Record<string, unknown>
    components?: {
        schemas?: Record<string, unknown>
        [key: string]: unknown
    }
    security?: Array<Record<string, unknown>>
    [key: string]: unknown
}

type OpenApiComponents = NonNullable<OpenApiDocument['components']>

const OPENAPI_PATH = path.resolve(__dirname, './openapi.json')
const BETTER_AUTH_SCHEMA_PATH = path.resolve(__dirname, './better-auth-openapi.json')

const readExistingOpenApi = (): OpenApiDocument => {
    if (!fs.existsSync(OPENAPI_PATH)) {
        return {}
    }

    const file = fs.readFileSync(OPENAPI_PATH, 'utf8')
    return JSON.parse(file) as OpenApiDocument
}

const mergeTags = (
    existing: Array<{ name: string; description?: string }> | undefined,
    incoming: Array<{ name: string; description?: string }> | undefined
): Array<{ name: string; description?: string }> | undefined => {
    if (!existing?.length && !incoming?.length) return undefined

    const merged = new Map<string, { name: string; description?: string }>()

    for (const tag of existing ?? []) {
        merged.set(tag.name, tag)
    }

    for (const tag of incoming ?? []) {
        merged.set(tag.name, tag)
    }

    return Array.from(merged.values())
}

const mergeOpenApi = (existing: OpenApiDocument, generated: OpenApiDocument): OpenApiDocument => {
    return {
        ...existing,
        ...generated,
        tags: mergeTags(existing.tags, generated.tags),
        paths: {
            ...(existing.paths ?? {}),
            ...(generated.paths ?? {})
        },
        components: {
            ...(existing.components ?? {}),
            ...(generated.components ?? {}),
            schemas: {
                ...(existing.components?.schemas ?? {}),
                ...(generated.components?.schemas ?? {})
            }
        }
    }
}

const mergeMissingComponents = (
    target: OpenApiDocument,
    source: OpenApiDocument,
    componentKey: keyof OpenApiComponents
): OpenApiDocument => {
    const sourceComponent = source.components?.[componentKey] as Record<string, unknown> | undefined

    if (!sourceComponent) {
        return target
    }

    const targetComponents = (target.components ?? {}) as OpenApiComponents
    const targetComponent = (targetComponents[componentKey] as Record<string, unknown> | undefined) ?? {}

    return {
        ...target,
        components: {
            ...targetComponents,
            [componentKey]: {
                ...sourceComponent,
                ...targetComponent
            }
        }
    }
}

const prefixBetterAuthPaths = (schema: OpenApiDocument, prefix: string): OpenApiDocument => {
    if (!schema.paths) return schema

    const prefixedPaths: Record<string, unknown> = {}
    for (const [path, value] of Object.entries(schema.paths)) {
        console.log(`🔀 Prefixing Better Auth path: ${path} -> ${prefix}${path}`)
        prefixedPaths[`${prefix}${path}`] = value
    }

    return { ...schema, paths: prefixedPaths }
}

const loadBetterAuthOpenApi = (): OpenApiDocument | null => {
    try {
        if (!fs.existsSync(BETTER_AUTH_SCHEMA_PATH)) {
            return null
        }

        const file = fs.readFileSync(BETTER_AUTH_SCHEMA_PATH, 'utf8')
        const schema = JSON.parse(file) as OpenApiDocument
        const prefixed = prefixBetterAuthPaths(schema, '/auth')

        console.log('✅ Loaded Better Auth OpenAPI schema from cache')
        return prefixed
    } catch (error) {
        console.warn('⚠️  Better Auth OpenAPI schema not available:', error instanceof Error ? error.message : error)
        return null
    }
}

const generate = async () => {
    const registry = createOpenApiRegistry()
    const existing = readExistingOpenApi()

    const generator = new OpenApiGeneratorV3(registry.definitions)

    const generated = generator.generateDocument({
        openapi: existing.openapi ?? '3.0.3',
        info: {
            title: existing.info?.title ?? 'Poveroh API',
            version: existing.info?.version ?? '1.0.0',
            description: existing.info?.description ?? 'OpenAPI definition for the Poveroh v1 API'
        },
        servers: existing.servers ?? [
            { url: 'http://localhost:3001/v1', description: 'API Poveroh Localhost v1' },
            { url: 'http://api.poveroh.local/v1', description: 'API Poveroh Localhost proxy v1' },
            { url: 'http://api.poveroh.com/v1', description: 'API Poveroh Production v1' }
        ],
        tags: existing.tags
    })

    let merged = mergeOpenApi(existing, generated as OpenApiDocument)

    const betterAuthSchema = await loadBetterAuthOpenApi()
    if (betterAuthSchema) {
        // Merge Better Auth paths/tags and backfill only missing components to keep refs valid.
        const betterAuthSubset: OpenApiDocument = {
            paths: betterAuthSchema.paths,
            tags: betterAuthSchema.tags
        }

        merged = mergeOpenApi(merged, betterAuthSubset)
        merged = mergeMissingComponents(merged, betterAuthSchema, 'schemas')
        merged = mergeMissingComponents(merged, betterAuthSchema, 'securitySchemes')

        console.log('✅ Merged Better Auth endpoints and backfilled missing components')
    }

    merged.components = {
        ...(merged.components ?? {}),
        securitySchemes: {
            ...((merged.components?.securitySchemes as Record<string, unknown> | undefined) ?? {}),
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    }

    merged.security = [{ bearerAuth: [] }]

    fs.writeFileSync(OPENAPI_PATH, `${JSON.stringify(merged, null, 4)}\n`, 'utf8')

    console.log(`✅ OpenAPI generated from code and merged: ${OPENAPI_PATH}`)
}

void generate()
