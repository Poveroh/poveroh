import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import config from '../utils/environment'
import { auth } from '../lib/auth'
import { fromNodeHeaders } from 'better-auth/node'
import { ResponseHelper } from '../utils'
import { logger } from '@poveroh/logger'
import { DEFAULT_USER, type User } from '@poveroh/types'
import { contextService } from '../api/v1/modules/base/context.service'

type AuthUserPayload = Pick<User, 'id'> & Partial<User>

// Builds a complete shared User object from auth providers that may only return identity fields.
function buildContextUser(user: AuthUserPayload): User {
    return {
        ...DEFAULT_USER,
        ...user,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : DEFAULT_USER.createdAt,
        updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : DEFAULT_USER.updatedAt
    }
}

// Runs the rest of the request pipeline inside a request-scoped AsyncLocalStorage so
// services and helpers can resolve the current user without taking it as a parameter.
function continueWithUserContext(user: User, next: NextFunction) {
    contextService.runWithContext({ user }, () => next())
}

export class AuthMiddleware {
    static async isAuthenticated(req: Request, res: Response, next: NextFunction) {
        try {
            // First try better-auth session validation
            const session = await auth.api.getSession({
                headers: fromNodeHeaders(req.headers)
            })

            if (session?.user) {
                const sessionUser = session.user as typeof session.user & { surname?: string }

                // Attach user to request object for compatibility with existing code
                req.user = buildContextUser({
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.name,
                    surname: sessionUser.surname || '',
                    createdAt: session.user.createdAt
                })
                return continueWithUserContext(req.user, next)
            }

            // Fallback to legacy JWT token for backward compatibility during migration
            const authHeader = req.headers.authorization
            const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined
            const token = bearerToken || req.cookies.token
            if (token) {
                jwt.verify(token, config.JWT_SECRET, (err: any, user: any) => {
                    if (err) {
                        return ResponseHelper.forbidden(res, 'Invalid token')
                    }
                    req.user = buildContextUser(user)
                    continueWithUserContext(req.user, next)
                })
                return
            }

            // No valid session found
            return ResponseHelper.unauthorized(res, 'No active session')
        } catch (error) {
            logger.error('Auth middleware error:', error)
            return ResponseHelper.forbidden(res, 'Invalid session')
        }
    }

    // Optional: Keep legacy method for gradual migration
    static isAuthenticatedLegacy(req: Request, res: Response, next: NextFunction) {
        const token = req.cookies.token

        if (!token) {
            return ResponseHelper.unauthorized(res, 'No token provided')
        }

        jwt.verify(token, config.JWT_SECRET, (err: any, user: any) => {
            if (err) {
                return ResponseHelper.forbidden(res, 'Invalid token')
            }

            req.user = buildContextUser(user)
            continueWithUserContext(req.user, next)
        })
    }
}
