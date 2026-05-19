import type { Request, Response } from 'express'
import { ResponseHelper, parseRequestBody } from '@/utils'
import { CreateSnapshotAccountBalanceRequestSchema } from '@poveroh/schemas'
import { SnapshotService } from './snapshot.service'

export class SnapshotController {
    private static readonly snapshotService = new SnapshotService()

    // POST /account-balance
    static async addAccountBalanceSnapshot(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(CreateSnapshotAccountBalanceRequestSchema, req.body)
            const data = await this.snapshotService.addAccountBalanceSnapshot(payload)

            return ResponseHelper.success(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
