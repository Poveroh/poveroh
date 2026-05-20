import type { Request, Response } from 'express'
import type { NetWorthEvolutionFilters, NetWorthEvolutionReport } from '@poveroh/types'
import { ResponseHelper } from '@/utils'
import { ReportService } from './report.service'

export class ReportController {
    private readonly reportService = new ReportService()

    // GET /trend
    async readTrend(req: Request, res: Response) {
        try {
            const filters = (req.query.filter ?? {}) as Partial<NetWorthEvolutionFilters>
            const report = await this.reportService.getNetWorthTrend(filters)

            return ResponseHelper.success<NetWorthEvolutionReport>(res, report)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
