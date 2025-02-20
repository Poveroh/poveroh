import nextIntlPlugin from 'next-intl/plugin'
import dotenv from 'dotenv'

const withNextIntl = nextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@poveroh/ui'],
    reactStrictMode: true,
    output: 'standalone'
}

dotenv.config({ path: '.env' })

export default withNextIntl(nextConfig)
