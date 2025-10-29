import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import config from '../utils/environment'
import { auth } from '../lib/auth'
import { fromNodeHeaders } from 'better-auth/node'

export class AuthMiddleware {
    static async isAuthenticated(req: Request, res: Response, next: NextFunction) {
        try {
            // First try better-auth session validation
            const session = await auth.api.getSession({
                headers: fromNodeHeaders(req.headers)
            })

            if (session?.user) {
                // Attach user to request object for compatibility with existing code
                req.user = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.name,
                    surname: (session.user as any).surname || '',
                    createdAt: session.user.createdAt
                }
                return next()
            }

            // Fallback to legacy JWT token for backward compatibility during migration
            const token = req.cookies.token
            if (token) {
                jwt.verify(token, config.JWT_SECRET, (err: any, user: any) => {
                    if (err) {
                        return res.status(403).json({ message: 'Invalid token' })
                    }
                    req.user = user
                    next()
                })
                return
            }

            // No valid session found
            res.status(401).json({ message: 'No active session' })
        } catch (error) {
            console.error('Auth middleware error:', error)
            res.status(403).json({ message: 'Invalid session' })
        }
    }

    // Optional: Keep legacy method for gradual migration
    static isAuthenticatedLegacy(req: Request, res: Response, next: NextFunction) {
        const token = req.cookies.token

        if (!token) {
            res.status(401).json({ message: 'No token provided' })
            return
        }

        jwt.verify(token, config.JWT_SECRET, (err: any, user: any) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' })
            }

            req.user = user
            next()
        })
    }
}
