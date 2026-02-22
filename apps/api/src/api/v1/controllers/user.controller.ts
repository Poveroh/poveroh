import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import logger from '../../../utils/logger'
import { components } from '../../../generated/openapi'
import { UserHelper } from '../helpers/user.helper'
import { getParamString } from '../../../utils/request'

// OpenAPI types
type User = components['schemas']['User']
type ErrorResponse = components['schemas']['ErrorResponse']

export class UserController {
    // GET /
    static async read(req: Request, res: Response) {
        try {
            const email = getParamString(req.params, 'email')

            if (!email) {
                res.status(400).json({ message: 'Missing email in path' })
                return
            }

            const user = await UserHelper.getUser(email)

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
            const id = getParamString(req.params, 'id')
            const { data } = req.body

            if (!data) throw new Error('Data not provided')
            if (!id) {
                res.status(400).json({ message: 'Missing user ID' })
                return
            }

            const parsedUser: Partial<User> = JSON.parse(data)

            const user = await prisma.user.findUnique({
                where: { id }
            })

            if (!user) {
                res.status(404).json({ message: 'User not found' })
                return
            }

            const updatedUser = await prisma.user.update({
                where: { id },
                data: parsedUser as any
            })

            res.status(200).json(updatedUser)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'Failed to update user', error })
        }
    }
}
