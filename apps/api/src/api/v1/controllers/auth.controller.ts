import { Request, Response } from 'express'
import { auth } from '../../../lib/auth'
import logger from '../../../utils/logger'
import { fromNodeHeaders } from 'better-auth/node'
import { success } from 'better-auth/*'

export class AuthController {
    // GET /session
    static async getSession(req: Request, res: Response) {
        try {
            const session = await auth.api.getSession({
                headers: fromNodeHeaders(req.headers)
            })
            res.json(session)
        } catch (error) {
            logger.error('Session error:', error)
            res.status(401).json({ error: 'No session found' })
        }
    }

    // POST /sign-up/email
    static async signUp(req: Request, res: Response) {
        try {
            const result = await auth.api.signUpEmail({
                body: req.body,
                headers: fromNodeHeaders(req.headers)
            })
            res.json(result)
        } catch (error) {
            logger.error('Sign up error:', error)
            res.status(400).json({ error: 'Sign up failed' })
        }
    }

    // POST /sign-in/email
    static async signIn(req: Request, res: Response) {
        try {
            const result = await auth.api.signInEmail({
                body: req.body,
                headers: fromNodeHeaders(req.headers)
            })
            res.json(result)
        } catch (error) {
            logger.error('Sign in error:', error)
            res.status(401).json({ error: 'Sign in failed' })
        }
    }

    // POST /sign-out
    static async signOut(req: Request, res: Response) {
        try {
            const result = await auth.api.signOut({
                headers: fromNodeHeaders(req.headers)
            })
            res.json(result)
        } catch (error) {
            logger.error('Sign out error:', error)
            res.status(400).json({ error: 'Sign out failed' })
        }
    }
}
