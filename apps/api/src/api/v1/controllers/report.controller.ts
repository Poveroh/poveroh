import { Request, Response } from 'express'
import { NetWorthEvolutionFilters } from '@poveroh/types/contracts'
import { ResponseHelper } from '@/src/utils'
import { ReportService } from '../services/report.service'

export class ReportController {
    // GET /report/trend
    static async readTrend(req: Request, res: Response) {
        try {
            const filters = (req.query.filter ?? {}) as Partial<NetWorthEvolutionFilters>

            const reportService = new ReportService(req.user.id)
            const report = await reportService.getNetWorthTrend(filters)

            return ResponseHelper.success(res, report)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
