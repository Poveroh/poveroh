import { Request, Response } from 'express'
import { ResponseHelper, BadRequestError, NotFoundError } from '@/src/utils'
import { UpdateUserRequest, User } from '@poveroh/types'
import { UserService } from '@/src/api/v1/modules/dashboard/services/user.service'

export class UserController {
    // GET /me
    static async getAuthenticatedUser(req: Request, res: Response) {
        try {
            const userService = new UserService()
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

            const userService = new UserService()
            await userService.updateUser(req.user.id, parsedUser)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
