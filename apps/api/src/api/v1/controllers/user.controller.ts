import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import bcrypt from 'bcryptjs'
import logger from '../../../utils/logger'

export class UserController {
    // GET /me
    static async me(req: Request, res: Response) {
        try {
            const user = await prisma.user.findUnique({
                where: { email: req.user.email },
                select: {
                    id: true,
                    name: true,
                    surname: true,
                    email: true,
                    createdAt: true
                }
            })

            if (!user) {
                res.status(404).json({ message: 'User not found' })
                return
            }

            res.status(200).json(user)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    // POST /
    static async add(req: Request, res: Response) {
        try {
            const { name, surname, email, password } = req.body

            const existingUser = await prisma.user.findUnique({
                where: { email }
            })

            if (existingUser) {
                res.status(409).json({ message: 'User already exists' })
                return
            }

            const hashedPassword = await bcrypt.hash(password, 12)

            const newUser = await prisma.user.create({
                data: {
                    name,
                    surname,
                    email,
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

            res.status(201).json(newUser)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    // PUT /:id
    static async save(req: Request, res: Response) {
        try {
            const { id } = req.params

            const user = await prisma.user.findUnique({
                where: { id }
            })

            if (!user) {
                res.status(404).json({ message: 'User not found' })
                return
            }

            const updatedUser = await prisma.user.update({
                where: { id },
                data: {
                    name: req.body.name,
                    surname: req.body.surname
                },
                select: {
                    id: true,
                    name: true,
                    surname: true,
                    email: true,
                    createdAt: true
                }
            })

            res.status(200).json(updatedUser)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'Failed to update user', error })
        }
    }

    // PUT /:id/set-password
    static async updatePassword(req: Request, res: Response) {
        try {
            const { id } = req.params
            const { oldPassword, newPassword } = req.body

            const user = await prisma.user.findUnique({
                where: { id }
            })

            if (!user) {
                res.status(404).json({ message: 'User not found' })
                return
            }

            const isSame = await bcrypt.compare(newPassword, user.password)
            if (isSame) {
                res.status(400).json({
                    message: 'Password cannot be the same as the old one'
                })
                return
            }

            const hashedPassword = await bcrypt.hash(newPassword, 12)

            await prisma.user.update({
                where: { id },
                data: { password: hashedPassword }
            })

            res.status(200).json({ success: true })
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'Failed to update password', error })
        }
    }
}
