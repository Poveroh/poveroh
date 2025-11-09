/* eslint-env node */
import nextIntlPlugin from 'next-intl/plugin'
import nextEnv from '@next/env'
import path from 'node:path'

const withNextIntl = nextIntlPlugin('./i18n/request.ts')

// Load environment variables using Next's env loader so both server and build-time
// have access to values from .env, .env.local, etc.
const projectDir = path.dirname(new URL(import.meta.url).pathname)
const { loadEnvConfig } = nextEnv
loadEnvConfig(projectDir)

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@poveroh/ui'],
    reactStrictMode: true,
    output: 'standalone'
}

export default withNextIntl(nextConfig)
