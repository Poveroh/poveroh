const config = {
    PORT: process.env.API_PORT,
    CDN_PORT: process.env.CDN_PORT,
    JWT_SECRET: process.env.JWT_KEY || ''
}

export default config
