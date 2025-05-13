import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import bcrypt from 'bcryptjs'

export class UserController {
    static async me(req: Request, res: Response) {
        try {
            const user = await prisma.users.findUnique({
                where: { email: req.user.email },
                select: {
                    id: true,
                    name: true,
                    surname: true,
                    email: true,
                    created_at: true
                }
            })

            if (!user) {
                res.status(404).json({ message: 'User not found' })
                return
            }

            res.status(200).json(user)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async add(req: Request, res: Response) {
        try {
            const user = await prisma.users.findUnique({
                where: { email: req.user.email },
                select: {
                    id: true,
                    name: true,
                    surname: true,
                    email: true,
                    created_at: true
                }
            })

            if (!user) {
                res.status(404).json({ message: 'User not found' })
                return
            }

            res.status(200).json(user)
        } catch (error) {
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async save(req: Request, res: Response) {
        try {
            const user = await prisma.users.findUnique({
                where: {
                    email: req.user.email
                }
            })

            if (!user) {
                res.status(404).json({ message: 'User not found' })
                return
            }

            await prisma.users.update({
                where: { email: req.user.email },
                data: req.body
            })

            res.status(200).json({ success: true })
        } catch (error) {
            res.status(500).json({ message: 'Failed to update user', error })
        }
    }

    static async updatePassword(req: Request, res: Response) {
        try {
            const { oldPassword, newPassword } = req.body

            const user = await prisma.users.findUnique({
                where: { email: req.user.email }
            })

            if (!user) {
                res.status(400).json({
                    message: 'User not found'
                })
                return
            }

            if (await bcrypt.compare(newPassword, user.password)) {
                res.status(400).json({
                    message: 'Password cannot be the same as the old one'
                })
                return
            }

            const newPasswordEncrypted = await bcrypt.hash(newPassword, 12)

            await prisma.users.update({
                where: { email: req.user.email },
                data: { password: newPasswordEncrypted }
            })

            res.status(200).json({ success: true })
        } catch (error) {
            res.status(500).json({
                message: 'Failed to update password',
                error
            })
        }
    }
}
