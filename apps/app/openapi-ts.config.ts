import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
    input: '../api/openapi.json',
    output: './generated/api'
})
