import { Request, Response } from 'express'
import { GetDashboardLayout, UpdateDashboardLayoutRequest } from '@poveroh/types'
import { BadRequestError, ResponseHelper } from '@/src/utils'
import { DashboardService } from '@/src/api/v1/modules/dashboard/dashboard.service'

export class DashboardController {
    // GET /
    static async getDashboard(req: Request, res: Response) {
        try {
            const dashboardService = new DashboardService()

            const dashboardLayout = await dashboardService.getDashboardLayout()
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

            const dashboardService = new DashboardService()
            await dashboardService.saveDashboardLayout(payload)

            return ResponseHelper.success(res)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
