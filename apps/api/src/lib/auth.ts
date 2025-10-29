import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@poveroh/prisma'
import config from '../utils/environment'

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql'
    }),
    secret: config.JWT_SECRET,
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        autoSignIn: true,
        minPasswordLength: 6,
        maxPasswordLength: 128
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
        enabled: true,
        window: 60 * 1000, // 1 minute
        max: 10 // 10 requests per minute per IP
    },
    advanced: {
        database: {
            generateId: () => {
                return crypto.randomUUID()
            }
        },
        crossSubDomainCookies: {
            enabled: false
        }
    }
})

export type Auth = typeof auth
