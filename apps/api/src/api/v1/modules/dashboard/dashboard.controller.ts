import { Request, Response } from 'express'
import { GetDashboardLayout } from '@poveroh/types'
import { BadRequestError, parseRequestBody, ResponseHelper } from '@/utils'
import { DashboardService } from '@/v1/modules/dashboard/dashboard.service'
import { UpdateDashboardLayoutRequestSchema } from '@poveroh/schemas'

export class DashboardController {
    private static readonly dashboardService = new DashboardService()

    // GET /
    static async getDashboard(req: Request, res: Response) {
        try {
            const dashboardLayout = await this.dashboardService.getDashboardLayout()
            return ResponseHelper.success<GetDashboardLayout>(res, dashboardLayout)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PUT /
    static async updateDashboard(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(UpdateDashboardLayoutRequestSchema, req.body)

            if (!payload) {
                throw new BadRequestError('Layout not provided')
            }

            await this.dashboardService.saveDashboardLayout(payload)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
