/* eslint-env node */
import nextIntlPlugin from 'next-intl/plugin'
import nextEnv from '@next/env'
import path from 'node:path'
import { withSentryConfig } from '@sentry/nextjs'

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

const hasSentry = !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)

export default hasSentry
    ? withSentryConfig(withNextIntl(nextConfig), {
          silent: true,
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          disableServerWebpackPlugin: !process.env.SENTRY_DSN,
          disableClientWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN
      })
    : withNextIntl(nextConfig)
