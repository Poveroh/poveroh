import type { CurrencyEnum } from '@poveroh/types'
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
     * Generates or refreshes the net-worth snapshot of a user at a date, linking each active account to its balance point as-of that date instead of copying the value, so retroactive corrections to that point flow through automatically. Every active asset is also frozen into the snapshot, falling back to its cached current valuation where no more precise historical link already exists.
     * @param userId The ID of the user the snapshot belongs to.
     * @param snapshotDate The snapshot date (ISO string), used both as the unique key and as the as-of date for the account links.
     * @returns A promise that resolves when the snapshot, its account links, and its asset links have been persisted.
     */
    async generateSnapshot(userId: string, snapshotDate: string): Promise<void> {
        const snapshot = await this.snapshotRepository.upsertSnapshot(userId, snapshotDate)
        const accounts = await this.snapshotRepository.findActiveAccountIds(userId)
        const asOf = new Date(snapshotDate)

        for (const account of accounts) {
            const balanceId = await this.accountBalanceRepository.findBalanceIdAsOf(account.id, asOf)
            await this.snapshotRepository.upsertAccountBalanceLink(snapshot.id, account.id, balanceId)
        }

        await this.freezeUnlinkedAssets(userId, snapshot.id)

        await this.snapshotRepository.refreshTotalsFromLinks(snapshot.id)
        await eventBus.emit('snapshot.generated', { userId, snapshotId: snapshot.id })
    }

    /**
     * Freezes every active asset's cached current valuation into a snapshot, skipping assets that already have a link for that snapshot (e.g. a market-synced daily price), so the more precise historical value is never overwritten.
     * @param userId The ID of the user who owns the assets.
     * @param snapshotId The unique identifier of the snapshot the values are linked to.
     * @returns A promise that resolves when every unlinked asset has been frozen.
     */
    private async freezeUnlinkedAssets(userId: string, snapshotId: string): Promise<void> {
        const [assets, linkedAssetIds] = await Promise.all([
            this.snapshotRepository.findActiveAssets(userId),
            this.snapshotRepository.findLinkedAssetIds(snapshotId)
        ])
        const linked = new Set(linkedAssetIds)

        for (const asset of assets) {
            if (linked.has(asset.id)) continue

            await this.snapshotRepository.upsertAssetValueLink(snapshotId, asset.id, {
                quantity: asset.quantity,
                unitPrice: asset.quantity > 0 ? asset.currentValue / asset.quantity : asset.currentValue,
                totalValue: asset.currentValue,
                currency: asset.currency,
                source: 'MANUAL'
            })
        }
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

    /**
     * Backfills an asset's daily valuation into the user's net-worth snapshots, one day at a time, from the first day it was held up to today.
     * @param userId The ID of the user who owns the asset.
     * @param assetId The unique identifier of the asset being valued.
     * @param currency The asset's own currency, stored alongside each day's valuation.
     * @param dailyHoldings The quantity held and the unit price to value it at, for each day the asset was held.
     * @returns A promise that resolves when every day's snapshot has been backfilled.
     */
    async backfillAssetSnapshots(
        userId: string,
        assetId: string,
        currency: CurrencyEnum,
        dailyHoldings: { date: string; quantity: number; unitPrice: number }[]
    ): Promise<void> {
        for (const holding of dailyHoldings) {
            const snapshot = await this.snapshotRepository.upsertSnapshot(userId, holding.date)

            await this.snapshotRepository.upsertAssetValueLink(snapshot.id, assetId, {
                quantity: holding.quantity,
                unitPrice: holding.unitPrice,
                totalValue: holding.quantity * holding.unitPrice,
                currency,
                source: 'MARKET'
            })

            await this.snapshotRepository.refreshTotalsFromLinks(snapshot.id)
        }
    }
}
