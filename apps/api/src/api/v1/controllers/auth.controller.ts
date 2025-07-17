import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import bcrypt from 'bcryptjs'
import { AuthHelper } from '../../../helpers/auth.helper'
import { IUserToSave } from '@poveroh/types'
import logger from '../../../utils/logger'

export class AuthController {
    //POST /login
    static async signIn(req: Request, res: Response) {
        try {
            const { email, password } = req.body

            if (!email || !password) {
                res.status(400).json({ message: 'Email and password are required' })
                return
            }

            const user = await prisma.user.findUnique({ where: { email } })
            if (!user || !(await bcrypt.compare(password, user.password))) {
                res.status(401).json({ message: 'Invalid credentials' })
                return
            }

            const { browser, os } = AuthHelper.getDeviceInfo(req.headers['user-agent'])

            await prisma.userLogin.create({
                data: {
                    device: os,
                    browser: browser,
                    ip: req.ip || '-',
                    location: '-',
                    userId: user.id
                }
            })

            const token = AuthHelper.generateToken(user)
            res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000 })

            res.status(200).json({ success: true })
        } catch (error: any) {
            logger.error(error)
            res.status(500).json({
                message: 'An error occurred during login',
                error: error.message
            })
        }
    }

    //POST /sign-up
    static async signUp(req: Request, res: Response) {
        try {
            const user: IUserToSave = req.body

            if (!user.email || !user.password || !user.name) {
                res.status(400).json({ message: 'Name, email, and password are required' })
                return
            }

            const existingUser = await prisma.user.findUnique({ where: { email: user.email } })
            if (existingUser) {
                res.status(409).json({ message: 'Email already in use' })
                return
            }

            const hashedPassword = await bcrypt.hash(user.password, 12)

            const newUser = await prisma.user.create({
                data: {
                    ...user,
                    password: hashedPassword
                },
                select: {
                    id: true,
                    name: true,
                    surname: true,
                    email: true,
                    createdAt: true
                }
            })

            const { browser, os } = AuthHelper.getDeviceInfo(req.headers['user-agent'])

            await prisma.userLogin.create({
                data: {
                    device: os,
                    browser: browser,
                    ip: req.ip || '-',
                    location: '-',
                    userId: newUser.id
                }
            })

            const token = AuthHelper.generateToken(newUser)
            res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000 })

            res.status(200).json(newUser)
        } catch (error: any) {
            logger.error(error)
            res.status(500).json({
                message: 'An error occurred during registration',
                error: error.message
            })
        }
    }
}
