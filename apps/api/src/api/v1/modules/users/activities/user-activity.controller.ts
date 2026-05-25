import type { Request, Response } from 'express'
import type { UserActivityData, UserActivityFilters } from '@poveroh/types'
import { ResponseHelper } from '@/utils'
import { UserActivityService } from './user-activity.service'

export class UserActivityController {
    private readonly activityService = new UserActivityService()

    // GET /me/activities
    async getAuthenticatedUserActivities(req: Request, res: Response) {
        try {
            const filters = (req.query as unknown as UserActivityFilters) ?? {}
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const data = await this.activityService.getActivities(filters, skip, take)

            return ResponseHelper.success<UserActivityData[]>(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
