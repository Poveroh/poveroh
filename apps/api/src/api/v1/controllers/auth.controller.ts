import { Request, Response } from 'express'
import { auth } from '../../../lib/auth'
import logger from '../../../utils/logger'
import { fromNodeHeaders } from 'better-auth/node'

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

    // POST /sign-up
    static async signUp(req: Request, res: Response) {
        try {
            const result = await auth.api.signUpEmail({
                body: req.body,
                headers: req.headers as any
            })
            res.json(result)
        } catch (error) {
            logger.error('Sign up error:', error)
            res.status(400).json({ error: 'Sign up failed' })
        }
    }

    // POST /sign-in
    static async signIn(req: Request, res: Response) {
        try {
            const result = await auth.api.signInEmail({
                body: req.body,
                headers: req.headers as any
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
                headers: req.headers as any
            })
            res.json(result)
        } catch (error) {
            logger.error('Sign out error:', error)
            res.status(400).json({ error: 'Sign out failed' })
        }
    }

    // GET /test - endpoint per verificare che le route auth funzionino
    static async test(req: Request, res: Response) {
        res.json({ message: 'Auth controller is working' })
    }
}
