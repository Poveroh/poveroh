import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import bcrypt from 'bcryptjs'
import logger from '../../../utils/logger'
import { IUserToSave } from '@poveroh/types'

export class UserController {
    // GET /
    static async read(req: Request, res: Response) {
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

    // PUT /:id
    static async save(req: Request, res: Response) {
        try {
            const { id } = req.params
            const { data } = req.body

            if (!data) throw new Error('Data not provided')

            const parsedUser: IUserToSave = JSON.parse(data)

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
                    name: parsedUser.name,
                    surname: parsedUser.surname
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
}
