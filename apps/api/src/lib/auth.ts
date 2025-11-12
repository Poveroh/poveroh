import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@poveroh/prisma'
import config from '../utils/environment'

const isProduction = config.NODE_ENV === 'production'
const allowedOrigins = config.ALLOWED_ORIGINS

// Extract shared domain from allowed origins for cross-subdomain cookies
const getSharedDomain = (): string | undefined => {
    if (!isProduction || !allowedOrigins.length) return undefined

    try {
        const url = new URL(config.APP_URL || allowedOrigins[0] || 'http://localhost')

        console.log('Shared domain extraction from URL:', url)

        const hostname = url.hostname

        // Extract domain (remove first subdomain)
        const parts = hostname.split('.')
        if (parts.length >= 2) {
            return `.${parts.slice(-2).join('.')}`
        }
        return '.localhost'
    } catch (e) {
        console.warn('Could not extract shared domain from allowed origins:', e)
    }

    return undefined
}

const sharedDomain = getSharedDomain()

export const auth = betterAuth({
    basePath: '/v1/auth',
    database: prismaAdapter(prisma, {
        provider: 'postgresql'
    }),
    secret: config.JWT_SECRET,
    trustedOrigins: allowedOrigins,
    cors: {
        enabled: true,
        allowedOrigins: allowedOrigins,
        allowCredentials: true
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        autoSignIn: true,
        minPasswordLength: 6,
        maxPasswordLength: 128
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user, ctx) => {
                    return {
                        data: {
                            ...user,
                            name: user.name.split(' ')[0],
                            surname: user.name.split(' ')[1]
                        }
                    }
                }
            },
            update: {
                before: async (user, ctx) => {
                    if (user.name) {
                        return {
                            data: {
                                ...user,
                                name: user.name.split(' ')[0],
                                surname: user.name.split(' ')[1]
                            }
                        }
                    }

                    return { data: user }
                }
            }
        }
    },
    session: {
        expiresIn: 60 * 60 * 24, // 24 hours (same as current JWT)
        updateAge: 60 * 60 * 24, // Update session every 24 hours
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 // 24 hours
        },
        // Force SameSite=None for cross-site session cookies in production so
        // the browser will send them on cross-origin requests when credentials
        // are included. Keep Lax for non-production to ease local dev.
        cookieAttributes: {
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax',
            httpOnly: true,
            domain: sharedDomain,
            path: '/'
        }
    },
    user: {
        additionalFields: {
            surname: {
                type: 'string',
                required: true,
                defaultValue: ''
            }
        },
        changeEmail: {
            enabled: true
        }
    },
    rateLimit: {
        enabled: false,
        window: 60 * 1000,
        max: 10
    },
    advanced: {
        // Enable cross-subdomain cookies when a shared domain is available.
        // This ensures cookies are set for the parent domain so they are shared
        // between subdomains like app.example.com and api.example.com.
        // If no shared domain is available (e.g., in non-production), we keep it disabled
        // to avoid BetterAuth throwing an error that baseURL is required.
        crossSubDomainCookies: {
            enabled: !!sharedDomain,
            domain: sharedDomain
        },
        database: {
            generateId: () => {
                return crypto.randomUUID()
            }
        },
        cookiePrefix: 'poveroh_auth_'
    }
})

export type Auth = typeof auth
