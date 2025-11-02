import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@poveroh/prisma'
import config from '../utils/environment'

export const auth = betterAuth({
    basePath: '/v1/auth',
    database: prismaAdapter(prisma, {
        provider: 'postgresql'
    }),
    secret: config.JWT_SECRET,
    trustedOrigins: ['*'],
    cors: {
        enabled: true,
        allowedOrigins: ['*'],
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
            }
        }
    },
    session: {
        expiresIn: 60 * 60 * 24, // 24 hours (same as current JWT)
        updateAge: 60 * 60 * 24, // Update session every 24 hours
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 // 24 hours
        }
    },
    user: {
        additionalFields: {
            surname: {
                type: 'string',
                required: true,
                defaultValue: ''
            }
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
            enabled: true
        }
    }
})

export type Auth = typeof auth
