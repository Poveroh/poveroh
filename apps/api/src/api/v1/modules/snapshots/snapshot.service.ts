import type { CreateSnapshotAccountBalanceRequest } from '@poveroh/types'
import { NotFoundError } from '@/utils'
import { RedisHelper } from '@poveroh/redis'
import { recalculateSubsequentSnapshots } from '../../helpers/snapshot.helper'
import { BaseService } from '../base/base.service'
import { SnapshotRepository } from './snapshot.repository'

export class SnapshotService extends BaseService {
    private readonly snapshotRepository = new SnapshotRepository()

    constructor() {
        super('snapshot')
    }

    /**
     * Creates or updates the account balance snapshot for the authenticated user, refreshing totals and the cached account balance when the snapshot is the most recent one.
     * @param payload The account balance snapshot data, including the financial account id, the balance and the snapshot date.
     * @returns A promise that resolves to the full snapshot enriched with account balances and asset values.
     */
    async addAccountBalanceSnapshot(payload: CreateSnapshotAccountBalanceRequest) {
        const userId = this.context.currentUser.id
        const { accountId, balance, snapshotDate } = payload

        const parsedBalance = Number(balance)

        const account = await this.snapshotRepository.findAccountById(userId, accountId)
        if (!account) {
            throw new NotFoundError('Financial account not found')
        }

        const snapshot = await this.snapshotRepository.upsertSnapshot(userId, snapshotDate)

        await this.snapshotRepository.upsertAccountBalance(snapshot.id, accountId, parsedBalance)
        await this.snapshotRepository.refreshSnapshotTotals(snapshot.id)

        await recalculateSubsequentSnapshots(accountId, snapshotDate, parsedBalance, userId)

        const latestSnapshot = await this.snapshotRepository.findLatestSnapshotForAccount(accountId)

        if (latestSnapshot?.snapshot.snapshotDate.getTime() === new Date(snapshotDate).getTime()) {
            await this.snapshotRepository.updateAccountBalance(accountId, parsedBalance)
            await RedisHelper.delete(`balance:${accountId}`)
        }

        return this.snapshotRepository.findSnapshotWithDetails(snapshot.id)
    }
}
