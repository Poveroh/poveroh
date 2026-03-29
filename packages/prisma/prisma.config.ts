import { defineConfig, env } from 'prisma/config'
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import { resolve } from 'path'

expand(config({ path: resolve(__dirname, '../../.env') }))

export default defineConfig({
    schema: 'schema.prisma',
    migrations: {
        path: 'migrations'
    },
    datasource: {
        url: env('DATABASE_URL')
    }
})
