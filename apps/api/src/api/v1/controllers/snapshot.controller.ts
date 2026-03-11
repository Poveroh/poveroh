import { Request, Response } from 'express'
import { CreateSnapshotAccountBalanceRequest } from '@poveroh/types/contracts'
import { getParamString } from '../../../utils/request'
import { BadRequestError, ResponseHelper } from '@/src/utils'
import { SnapshotService } from '../services/snapshot.service'

export class SnapshotController {
    // POST /account-balance
    static async addAccountBalanceSnapshot(req: Request, res: Response) {
        try {
            const accountId = getParamString(req.body, 'accountId')

            if (!accountId) {
                throw new BadRequestError('Missing financial account ID')
            }

            const { balance, snapshotDate, note } = req.body || {}

            if (balance === undefined || snapshotDate === undefined) {
                throw new BadRequestError('Missing balance or snapshotDate')
            }

            const parsedBalance = Number(balance)
            if (Number.isNaN(parsedBalance)) {
                throw new BadRequestError('Invalid balance value')
            }

            const payload: CreateSnapshotAccountBalanceRequest = {
                accountId,
                balance: String(balance),
                snapshotDate,
                note: note ?? ''
            }

            const snapshotService = new SnapshotService(req.user.id)
            const data = await snapshotService.addAccountBalanceSnapshot(payload)

            return ResponseHelper.success(res, data)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
