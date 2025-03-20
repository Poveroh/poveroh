export const config = {
    PORT: (process.env.API_PORT as string) || 3001,
    CDN_PORT: (process.env.CDN_PORT as string) || 3002,
    JWT_SECRET: process.env.JWT_KEY as string
}
