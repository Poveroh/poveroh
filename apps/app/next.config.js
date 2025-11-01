import nextIntlPlugin from 'next-intl/plugin'
// import dotenv from 'dotenv'

const withNextIntl = nextIntlPlugin()

// dotenv.config({ path: '.env' })

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@poveroh/ui'],
    reactStrictMode: true,
    output: 'standalone'
}

export default withNextIntl(nextConfig)
