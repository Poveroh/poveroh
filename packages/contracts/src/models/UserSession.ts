/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User'
export type UserSession = {
    session: {
        id: string
        createdAt: string
        updatedAt: string
        userId: string
        expiresAt: string
        token: string
        ipAddress: string | null
        userAgent: string | null
    }
    user: User
}
