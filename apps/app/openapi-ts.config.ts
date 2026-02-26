import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
    input: '../../packages/openapi/openapi.json',
    output: './api'
})
