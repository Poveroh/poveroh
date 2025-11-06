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
        const firstOrigin = allowedOrigins[0]
        const url = new URL(firstOrigin)
        const hostname = url.hostname

        console.log('Allowed origin:', firstOrigin)
        console.log('Extracting shared domain from hostname:', hostname)

        // Extract domain (remove first subdomain)
        // e.g., "app.mydomain.com" → ".mydomain.com"
        const parts = hostname.split('.')
        if (parts.length >= 2) {
            const sharedDomain = `.${parts.slice(-2).join('.')}`
            console.log('Extracted shared domain:', sharedDomain)
            return sharedDomain
        }
    } catch (e) {
        console.warn('Could not extract shared domain from allowed origins')
    }

    return undefined
}

const sharedDomain = getSharedDomain()

console.log('Better Auth config:', {
    isProduction,
    allowedOrigins,
    sharedDomain,
    cookieConfig: {
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        httpOnly: true,
        domain: sharedDomain
    }
})

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
            sameSite: isProduction ? 'none' : 'lax',
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
        window: 60 * 1000, // 1 minute
        max: 10 // 10 requests per minute per IP
    },
    advanced: {
        database: {
            generateId: () => {
                return crypto.randomUUID()
            }
        },
        cookiePrefix: 'poveroh_auth_',
        crossSubDomainCookies: {
            enabled: !!sharedDomain,
            domain: sharedDomain
        },
        // Explicitly provide cookieOptions as a stronger hint to the library
        // so that sameSite/secure/domain/path are applied when cookies are set.
        cookieOptions: {
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            httpOnly: true,
            domain: sharedDomain,
            path: '/'
        }
    }
})

export type Auth = typeof auth
