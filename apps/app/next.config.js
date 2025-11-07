/* eslint-env node */
import nextIntlPlugin from 'next-intl/plugin'
import { env } from 'next-runtime-env'
import nextEnv from '@next/env'
import path from 'node:path'

const withNextIntl = nextIntlPlugin()

// Load environment variables using Next's env loader so both server and build-time
// have access to values from .env, .env.local, etc.
const projectDir = path.dirname(new URL(import.meta.url).pathname)
const { loadEnvConfig } = nextEnv
loadEnvConfig(projectDir)

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@poveroh/ui'],
    reactStrictMode: true,
    output: 'standalone',
    // Proxy/rewrites so that client requests to /api/v1/* are forwarded to the
    // backend API (default localhost:3001). This keeps the client-side code
    // calling a same-origin path while the server actually serves the API.
    async rewrites() {
        const apiBase = env('NEXT_PUBLIC_API_URL') || ``
        return [
            {
                // Accept requests at /api/v1/* and forward them to the API's /v1/*
                source: '/api/v1/:path*',
                destination: `${apiBase}/v1/:path*`
            }
        ]
    }
}

export default withNextIntl(nextConfig)
