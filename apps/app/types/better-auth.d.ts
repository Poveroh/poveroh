import type { User } from '@poveroh/types'

declare module 'better-auth/react' {
    export interface Session {
        session: {
            id: string
            createdAt: Date
            updatedAt: Date
            userId: string
            expiresAt: Date
            token: string
            ipAddress?: string | null
            userAgent?: string | null
        }
        user: User
    }
}
