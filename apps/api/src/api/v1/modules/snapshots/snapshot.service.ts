import { BaseService } from '../base/base.service'
import { SnapshotRepository } from './snapshot.repository'
import { AccountBalanceRepository } from '../financial-accounts/account-balance/account-balance.repository'
import { eventBus } from '../../worker/events/event-bus'
import { addUtcDays, normalizeDate } from '@/utils'

export class SnapshotService extends BaseService {
    private readonly snapshotRepository = new SnapshotRepository()
    private readonly accountBalanceRepository = new AccountBalanceRepository()

    constructor() {
        super('snapshot')
    }

    /**
     * Generates or refreshes the net-worth snapshot of a user at a date, linking each active account to its balance point as-of that date instead of copying the value, so retroactive corrections to that point flow through automatically.
     * @param userId The ID of the user the snapshot belongs to.
     * @param snapshotDate The snapshot date (ISO string), used both as the unique key and as the as-of date for the account links.
     * @returns A promise that resolves when the snapshot and its account links have been persisted.
     */
    async generateSnapshot(userId: string, snapshotDate: string): Promise<void> {
        const snapshot = await this.snapshotRepository.upsertSnapshot(userId, snapshotDate)
        const accounts = await this.snapshotRepository.findActiveAccountIds(userId)
        const asOf = new Date(snapshotDate)

        for (const account of accounts) {
            const balanceId = await this.accountBalanceRepository.findBalanceIdAsOf(account.id, asOf)
            await this.snapshotRepository.upsertAccountBalanceLink(snapshot.id, account.id, balanceId)
        }

        await this.snapshotRepository.refreshTotalsFromLinks(snapshot.id)
        await eventBus.emit('snapshot.generated', { userId, snapshotId: snapshot.id })
    }

    /**
     * Regenerates the user's net-worth snapshots for every day from a retroactive balance or transaction change up to today: existing snapshots are re-linked to the rebuilt series and missing past days are created, so the daily wealth timeline stays consistent.
     * @param userId The ID of the user whose snapshots are refreshed.
     * @param fromDate The earliest date impacted by the change.
     * @returns A promise that resolves when the affected snapshots have been regenerated.
     */
    async refreshSnapshotsFrom(userId: string, fromDate: Date): Promise<void> {
        const today = normalizeDate(new Date())
        for (let day = normalizeDate(fromDate); day <= today; day = addUtcDays(day, 1)) {
            await this.generateSnapshot(userId, day.toISOString().split('T')[0]!)
        }
    }

    /**
     * Generates today's snapshot for every user who owns at least one active financial account, used by the daily scheduled job.
     * @param date An optional ISO date to generate for; defaults to today.
     * @returns A promise that resolves to the number of snapshots generated.
     */
    async generateDailySnapshots(date?: string): Promise<number> {
        const isoDate = (date ? new Date(date) : new Date()).toISOString().split('T')[0]!
        const userIds = await this.snapshotRepository.findUserIdsWithActiveAccounts()

        for (const userId of userIds) {
            await this.generateSnapshot(userId, isoDate)
        }

        return userIds.length
    }
}
