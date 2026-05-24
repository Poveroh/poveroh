import { NextFunction, Request, Response } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { logger } from '@poveroh/logger/server'
import { type User } from '@poveroh/types'
import { auth } from '@/lib'
import { contextService } from '@/v1/modules/base/context.service'
import { ResponseHelper } from '@/utils'

/**
 * Helper function to continue the request processing with the authenticated user context. It takes the authenticated user and the next function from Express middleware, sets up the context for the request using the ContextService, and then calls the next middleware in the chain.
 * @param user The authenticated user object to be set in the context for the request. This should contain at least the user's ID and any other relevant information needed for authorization and processing in downstream handlers.
 * @param next The next function from Express middleware, which should be called to continue processing the request after setting up the user context. This allows the request to proceed to the next middleware or route handler with the authenticated user information available in the context.
 */
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
                req.user = session.user as User

                return continueWithUserContext(req.user, next)
            }

            // No valid session found
            return ResponseHelper.unauthorized(res, 'No active session')
        } catch (error) {
            logger.error('Auth middleware error:', error)
            return ResponseHelper.forbidden(res, 'Invalid session')
        }
    }
}
