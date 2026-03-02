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
    [key: string]: unknown
}

const OPENAPI_PATH = path.resolve(__dirname, './openapi.json')

const readExistingOpenApi = (): OpenApiDocument => {
    if (!fs.existsSync(OPENAPI_PATH)) {
        return {}
    }

    const file = fs.readFileSync(OPENAPI_PATH, 'utf8')
    return JSON.parse(file) as OpenApiDocument
}

const mergeOpenApi = (existing: OpenApiDocument, generated: OpenApiDocument): OpenApiDocument => {
    return {
        ...existing,
        ...generated,
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

const generate = () => {
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

    const merged = mergeOpenApi(existing, generated as OpenApiDocument)

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

generate()
