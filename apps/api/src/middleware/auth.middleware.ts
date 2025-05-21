import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import config from '../utils/environment'

export class AuthMiddleware {
    static isAuthenticated(req: Request, res: Response, next: NextFunction) {
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
