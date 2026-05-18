import { Request, Response } from 'express'
import { GetDashboardLayout, UpdateDashboardLayoutRequest } from '@poveroh/types'
import { BadRequestError, ResponseHelper } from '@/utils'
import { DashboardService } from '@/v1/modules/dashboard/dashboard.service'

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
            const payload = req.body as UpdateDashboardLayoutRequest

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
