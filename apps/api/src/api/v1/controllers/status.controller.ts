import { Request, Response } from 'express'
import { ResponseHelper } from '@/src/utils'
import { StatusService } from '../services/status.service'

export class StatusController {
    // GET /
    static async isAlive(req: Request, res: Response) {
        try {
            const status = StatusService.getStatus()
            return ResponseHelper.success(res, status)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
