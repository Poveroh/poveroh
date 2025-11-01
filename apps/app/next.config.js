/* eslint-env node */
import nextIntlPlugin from 'next-intl/plugin'
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
    // For production client bundles, bake placeholders that our Docker startup
    // script will replace at runtime. Keep server/SSR using the real env so
    // prerender/build steps don't fail.
    webpack: (config, { isServer, dev, webpack }) => {
        if (!isServer && !dev) {
            config.plugins.push(
                new webpack.DefinePlugin({
                    'process.env.NEXT_PUBLIC_API_URL': JSON.stringify('BAKED_NEXT_PUBLIC_API_URL'),
                    'process.env.NEXT_PUBLIC_APP_VERSION': JSON.stringify('BAKED_NEXT_PUBLIC_APP_VERSION'),
                    'process.env.NEXT_PUBLIC_APP_NAME': JSON.stringify('BAKED_NEXT_PUBLIC_APP_NAME'),
                    'process.env.NEXT_PUBLIC_LOG_LEVEL': JSON.stringify('BAKED_NEXT_PUBLIC_LOG_LEVEL')
                })
            )
        }
        return config
    }
}

export default withNextIntl(nextConfig)
