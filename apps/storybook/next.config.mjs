/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@poveroh/ui'],
    images: {
        unoptimized: true
    },
    webpack: config => {
        // Ensure cache exists to prevent builder shutdown errors
        config.cache = { type: 'filesystem' }
        return config
    }
}

export default nextConfig
