import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { ResponseHelper, BadRequestError, NotFoundError } from '../../../utils'
import { UserHelper } from '../helpers/user.helper'
import { getParamString } from '../../../utils/request'
import { User } from '@poveroh/types/contracts'

export class UserController {
    // GET /
    static async getUser(req: Request, res: Response) {
        try {
            const email = req.user?.email

            if (!email) {
                throw new BadRequestError('Missing email in path')
            }

            const user = await UserHelper.getUserByEmail(email)

            if (!user) {
                throw new NotFoundError('User not found')
            }

            return ResponseHelper.success(res, user)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PUT
    static async updateUser(req: Request, res: Response) {
        try {
            const id = getParamString(req.params, 'id')
            const { data } = req.body

            if (!data) {
                throw new BadRequestError('Data not provided')
            }

            if (!id) {
                throw new BadRequestError('Missing user ID')
            }

            const parsedUser: Partial<User> = JSON.parse(data)

            const user = await prisma.user.findUnique({
                where: { id }
            })

            if (!user) {
                throw new NotFoundError('User not found')
            }

            const updatedUser = await prisma.user.update({
                where: { id },
                data: parsedUser
            })

            return ResponseHelper.success(res, updatedUser)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
