import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
    client: '@hey-api/client-axios',
    input: '../../packages/openapi/openapi.json',
    output: {
        path: './api'
    },
    plugins: [
        '@hey-api/typescript',
        '@hey-api/schemas',
        {
            enums: 'javascript',
            name: '@hey-api/sdk'
        },
        '@tanstack/react-query'
    ]
})
