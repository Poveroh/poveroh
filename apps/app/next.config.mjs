import nextIntlPlugin from 'next-intl/plugin'

const withNextIntl = nextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@poveroh/ui']
}

export default withNextIntl(nextConfig)
