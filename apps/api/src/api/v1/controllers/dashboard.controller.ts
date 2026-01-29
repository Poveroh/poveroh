import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import logger from '../../../utils/logger'
import { DashboardLayout } from '@poveroh/types'

export class DashboardController {
    // GET /
    static async read(req: Request, res: Response) {
        try {
            const userId = req.user.id

            const dashboardLayout = await prisma.dashboardLayout.findUnique({
                where: { userId }
            })

            res.status(200).json(dashboardLayout)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    // PUT /
    static async save(req: Request, res: Response) {
        try {
            const userId = req.user.id
            const payload = (req.body?.layout ?? req.body) as DashboardLayout | undefined

            if (!payload) {
                res.status(400).json({ message: 'Layout not provided' })
                return
            }

            const saved = await prisma.dashboardLayout.upsert({
                where: { userId },
                update: {
                    layout: payload,
                    version: payload.version || 1
                },
                create: {
                    userId,
                    layout: payload,
                    version: payload.version || 1
                }
            })

            res.status(200).json(saved)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
