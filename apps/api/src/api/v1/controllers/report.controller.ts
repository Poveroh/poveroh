import { Request, Response } from 'express'
import logger from '../../../utils/logger'
import { components } from '../../../generated/openapi'
import { buildWhere } from '../../../helpers/filter.helper'
import prisma from '@poveroh/prisma'

type NetWorthEvolutionFilters = components['schemas']['NetWorthEvolutionFilters']
type NetWorthEvolutionReport = components['schemas']['NetWorthEvolutionReport']

export class ReportController {
    // GET /report/trend
    static async readTrend(req: Request, res: Response) {
        try {
            const filters = (req.query.filter ?? {}) as Partial<NetWorthEvolutionFilters>

            const whereFilters = {
                ...filters,
                ...(filters?.date ? { snapshotDate: filters.date } : {})
            }

            if (filters?.date) {
                delete (whereFilters as Partial<NetWorthEvolutionFilters>).date
            }

            const where = buildWhere(whereFilters)

            const whereCondition = {
                ...where,
                userId: req.user.id
            }

            const data = await prisma.snapshot.findMany({
                where: whereCondition,
                orderBy: { snapshotDate: 'asc' }
            })

            const dataPoints = data.map(snapshot => ({
                date: snapshot.snapshotDate.toISOString(),
                totalNetWorth: Number(snapshot.totalNetWorth)
            }))

            const totalNetWorth = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].totalNetWorth : 0

            const report: NetWorthEvolutionReport = {
                totalNetWorth,
                dataPoints
            }

            res.status(200).json(report)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
