import { Request, Response } from 'express'
import { ResponseHelper, BadRequestError, NotFoundError } from '../../../utils'
import { getParamString } from '../../../utils/request'
import { UpdateUserRequest, User } from '@poveroh/types/contracts'
import { UserService } from '../services/user.service'

export class UserController {
    // GET /me
    static async getAuthenticatedUser(req: Request, res: Response) {
        try {
            const userService = new UserService(req.user.id)
            const user = await userService.getUser(req.user.id)

            if (!user) {
                throw new NotFoundError('User not found')
            }

            return ResponseHelper.success<User>(res, user)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /me
    static async updateUser(req: Request, res: Response) {
        try {
            if (!req.body) {
                throw new BadRequestError('Data not provided')
            }

            const parsedUser: UpdateUserRequest = req.body

            const userService = new UserService(req.user.id)
            await userService.updateUser(req.user.id, parsedUser)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
