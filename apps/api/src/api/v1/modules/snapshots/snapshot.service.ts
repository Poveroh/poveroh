import { BaseService } from '../base/base.service'
import { SnapshotRepository } from './snapshot.repository'
import { AccountBalanceRepository } from '../financial-accounts/account-balance/account-balance.repository'
import { eventBus } from '../../worker/events/event-bus'
import { addUtcDays, normalizeDate } from '@/utils'
import { isSnapshotDay } from '@/utils/snapshot'

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
     * Refreshes the user's net-worth snapshots after a retroactive balance or transaction change, regenerating every snapshot due under the user's frequency from the change date up to today: existing snapshots are re-linked to the rebuilt series and missing past ones are created, so the wealth timeline stays consistent.
     * @param userId The ID of the user whose snapshots are refreshed.
     * @param fromDate The earliest date impacted by the change; snapshots due on or after it are regenerated.
     * @returns A promise that resolves when the affected snapshots have been regenerated.
     */
    async refreshSnapshotsFrom(userId: string, fromDate: Date): Promise<void> {
        const frequency = await this.context.currentUser.preferences.snapshotFrequency
        if (!frequency || frequency === 'NONE') {
            return
        }

        const today = normalizeDate(new Date())
        for (let day = normalizeDate(fromDate); day <= today; day = addUtcDays(day, 1)) {
            if (!isSnapshotDay(frequency, day)) {
                continue
            }
            await this.generateSnapshot(userId, day.toISOString().split('T')[0]!)
        }
    }

    /**
     * Generates the snapshot for every user whose configured frequency falls due on the given date, used by the daily scheduled job.
     * @param date An optional ISO date to evaluate; defaults to today.
     * @returns A promise that resolves to the number of snapshots generated.
     */
    async generateDueSnapshots(date?: string): Promise<number> {
        const day = date ? new Date(date) : new Date()
        const isoDate = day.toISOString().split('T')[0]!
        const preferences = await this.snapshotRepository.findUserSnapshotFrequencies()

        let count = 0
        for (const preference of preferences) {
            if (!isSnapshotDay(preference.snapshotFrequency, day)) {
                continue
            }

            await this.generateSnapshot(preference.userId, isoDate)
            count++
        }

        return count
    }
}
