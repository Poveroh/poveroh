import { Request, Response } from 'express'
import { ResponseHelper } from '@/src/utils'
import { StatusService } from './status.service'

export class StatusController {
    private static readonly service = new StatusService()

    // GET /
    static async isAlive(req: Request, res: Response) {
        try {
            const status = this.service.getStatus()

            return ResponseHelper.success(res, status)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
