import { NextFunction, Request, Response } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { logger } from '@poveroh/logger/server'
import { auth } from '@/lib'
import { contextService } from '@/v1/modules/base/context.service'
import { ResponseHelper } from '@/utils'

export class AuthMiddleware {
    static async isAuthenticated(req: Request, res: Response, next: NextFunction) {
        try {
            // First try better-auth session validation
            const session = await auth.api.getSession({
                headers: fromNodeHeaders(req.headers)
            })

            if (session?.user) {
                req.user = session.user

                return contextService.runWithContext({ user: session.user }, () => next())
            }

            // No valid session found
            return ResponseHelper.unauthorized(res, 'No active session')
        } catch (error) {
            logger.error('Auth middleware error:', error)
            return ResponseHelper.forbidden(res, 'Invalid session')
        }
    }
}
