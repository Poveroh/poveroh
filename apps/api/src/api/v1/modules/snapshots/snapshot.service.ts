import { BaseService } from '../base/base.service'
import { SnapshotRepository } from './snapshot.repository'
import { AccountBalanceRepository } from '../financial-accounts/account-balance/account-balance.repository'
import { eventBus } from '../../worker/events/event-bus'

/**
 * Returns true when the given date is the last calendar day of its month.
 * @param date The date to test.
 * @returns Whether the date is the last day of the month.
 */
function isLastDayOfMonth(date: Date): boolean {
    const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1))
    return next.getUTCMonth() !== date.getUTCMonth()
}

/**
 * Decides whether a snapshot is due on a given date for a configured frequency.
 * @param frequency The user's configured snapshot frequency.
 * @param date The candidate date (defaults to UTC day boundaries).
 * @returns Whether a snapshot should be generated on that date.
 */
function isSnapshotDay(frequency: string, date: Date): boolean {
    switch (frequency) {
        case 'DAILY':
            return true
        case 'WEEKLY':
            // Generate on Mondays.
            return date.getUTCDay() === 1
        case 'MONTHLY':
            return isLastDayOfMonth(date)
        case 'QUARTERLY':
            return isLastDayOfMonth(date) && [2, 5, 8, 11].includes(date.getUTCMonth())
        case 'SEMIANNUAL':
            return isLastDayOfMonth(date) && [5, 11].includes(date.getUTCMonth())
        case 'ANNUAL':
            return isLastDayOfMonth(date) && date.getUTCMonth() === 11
        case 'NONE':
        default:
            return false
    }
}

export class SnapshotService extends BaseService {
    private readonly snapshotRepository = new SnapshotRepository()
    private readonly accountBalanceRepository = new AccountBalanceRepository()

    constructor() {
        super('snapshot')
    }

    /**
     * Generates or refreshes the net-worth snapshot of a user at a date, linking each account to its balance point as-of that date instead of copying the value, so retroactive corrections flow through automatically.
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
     * Refreshes the links and cached totals of the snapshots affected by a retroactive balance change of an account, so the cached net worth stays correct without recomputing on read.
     * @param userId The ID of the user whose snapshots are refreshed.
     * @param accountId The financial account whose balance changed.
     * @param fromDate The earliest date impacted by the change; only snapshots on or after it are refreshed.
     * @returns A promise that resolves when the affected snapshots have been refreshed.
     */
    async refreshSnapshotsFrom(userId: string, accountId: string, fromDate: Date): Promise<void> {
        const snapshots = await this.snapshotRepository.findSnapshotsFromDate(userId, fromDate)

        for (const snapshot of snapshots) {
            const balanceId = await this.accountBalanceRepository.findBalanceIdAsOf(accountId, snapshot.snapshotDate)
            await this.snapshotRepository.upsertAccountBalanceLink(snapshot.id, accountId, balanceId)
            await this.snapshotRepository.refreshTotalsFromLinks(snapshot.id)
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
