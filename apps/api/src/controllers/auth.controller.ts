import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { UAParser } from 'ua-parser-js'
import { JWT_SECRET } from '..'

export class AuthController {
    static async signIn(req: Request, res: Response) {
        try {
            const { email, password } = req.body

            if (!email || !password) {
                res.status(400).json({
                    message: 'Email and password are required'
                })
                return
            }

            const user = await prisma.users.findUnique({
                where: {
                    email: email
                }
            })

            if (!user || !(await bcrypt.compare(password, user.password))) {
                res.status(401).json({ message: 'Invalid credentials' })
                return
            }

            const parser = new UAParser()
            const agent = parser.setUA('Mozilla/5.0 ...').getResult()

            const browser = `${agent.browser.name} ${agent.browser.major}`
            const os = `${agent.os.name} ${agent.os.version}`

            await prisma.users_login.create({
                data: {
                    device: os,
                    browser: browser,
                    ip: '-',
                    location: '-',
                    user_id: user.id
                }
            })

            const token: string = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET || '-', {
                expiresIn: '24h'
            })

            res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000 })

            res.status(200).json(true)
        } catch (error: any) {
            console.log(error)
            res.status(500).json({
                message: 'An error occurred during login',
                error: error.message
            })
        }
    }
}
