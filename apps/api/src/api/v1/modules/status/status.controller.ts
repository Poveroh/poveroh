import type { Request, Response } from 'express'
import type { StatusResponse } from '@poveroh/types'
import { ResponseHelper } from '@/utils'
import { StatusService } from './status.service'

export class StatusController {
    private static readonly statusService = new StatusService()

    // GET /
    static async isAlive(req: Request, res: Response) {
        try {
            const status = this.statusService.getStatus()

            return ResponseHelper.success<StatusResponse>(res, status)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
