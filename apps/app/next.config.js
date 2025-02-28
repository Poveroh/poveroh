import nextIntlPlugin from 'next-intl/plugin'
import dotenv from 'dotenv'
import path from 'path'

const withNextIntl = nextIntlPlugin()

dotenv.config({ path: '.env' })

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@poveroh/ui'],
    reactStrictMode: true,
    output: 'standalone',
    outputFileTracingRoot: path.join(path.dirname(new URL(import.meta.url).pathname), '../../')
}

export default withNextIntl(nextConfig)
