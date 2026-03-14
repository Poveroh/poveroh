import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Generate Better Auth OpenAPI schema and save to temporary file.
 * This runs as a separate script to avoid ESM/CommonJS conflicts.
 */
const generate = async () => {
    try {
        const authPath = path.resolve(__dirname, '../../apps/api/src/lib/auth.ts')
        const { auth } = await import(authPath)
        const schema = await auth.api.generateOpenAPISchema()

        const outputPath = path.resolve(__dirname, './better-auth-openapi.json')
        fs.writeFileSync(outputPath, JSON.stringify(schema, null, 4), 'utf8')

        console.log('✅ Better Auth OpenAPI schema generated')
    } catch (error) {
        console.error('❌ Failed to generate Better Auth OpenAPI schema:', error)
        process.exit(1)
    }
}

void generate()
