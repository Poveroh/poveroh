import type { Request, Response } from 'express'
import type { UpdateUserRequest, User } from '@poveroh/types'
import { NotFoundError, ResponseHelper, parseRequestBody } from '@/utils'
import { UpdateUserSchemaRequest } from '@poveroh/schemas'
import { UserService } from './user.service'

export class UserController {
    private readonly userService = new UserService()

    // GET /me
    async getAuthenticatedUser(req: Request, res: Response) {
        try {
            const user = await this.userService.getUser(req.user.id)
            if (!user) throw new NotFoundError('User not found')

            return ResponseHelper.success<User>(res, user)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /me
    async updateUser(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(UpdateUserSchemaRequest, req.body) as unknown as UpdateUserRequest
            await this.userService.updateUser(req.user.id, payload)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
