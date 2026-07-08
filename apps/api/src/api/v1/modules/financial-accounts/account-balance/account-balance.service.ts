import type {
    CreateFinancialAccountBalanceRequest,
    FinancialAccountBalanceData,
    FinancialAccountData
} from '@poveroh/types'
import { NotFoundError, addUtcDays, normalizeDate } from '@/utils'
import { BaseService } from '../../base/base.service'
import { AccountBalanceRepository } from './account-balance.repository'
import { SnapshotService } from '../../snapshots/snapshot.service'
import { eventBus } from '@/v1/worker/events/event-bus'
import { FinancialAccountService } from '../financial-account.service'
import { Prisma } from '@poveroh/prisma'

export class AccountBalanceService extends BaseService {
    private readonly accountBalanceRepository = new AccountBalanceRepository()
    private readonly snapshotService = new SnapshotService()
    private financialAccountServiceInstance?: FinancialAccountService

    constructor() {
        super('account-balance')
    }

    private get financialAccountService(): FinancialAccountService {
        return (this.financialAccountServiceInstance ??= new FinancialAccountService())
    }

    /**
     * Records a manual balance anchor for a financial account at a date, recomputes the subsequent daily series and the account's snapshots, and returns the updated account.
     * @param payload The manual balance data, including the financial account id, the balance, the date and an optional note.
     * @returns A promise resolving to the updated financial account data.
     */
    async upsertBalance(
        payload: CreateFinancialAccountBalanceRequest,
        isManual: boolean
    ): Promise<FinancialAccountData> {
        const userId = this.context.currentUser.id

        await this.financialAccountService.doesAccountExist(payload.financialAccountId, true)

        const balanceData = await this.accountBalanceRepository.upsertBalance(payload, isManual)

        await this.recomputeBalances(balanceData)
        await this.snapshotService.refreshSnapshotsFrom(userId, normalizeDate(balanceData.date))

        const updated = await this.financialAccountService.getFinancialAccountById(payload.financialAccountId)
        if (!updated) {
            throw new NotFoundError('Financial account not found')
        }

        await eventBus.emit('financial-account.updated', { userId, data: updated })

        return updated
    }

    /**
     * Reads the balance time-series of a financial account owned by the current user within an optional date range.
     * @param financialAccountId The financial account whose series is requested.
     * @param from An optional inclusive lower bound date (ISO string).
     * @param to An optional inclusive upper bound date (ISO string).
     * @returns A promise resolving to the ordered balance points used to build the chart.
     */
    async getSeries(financialAccountId: string, from?: string, to?: string): Promise<FinancialAccountBalanceData[]> {
        await this.financialAccountService.doesAccountExist(financialAccountId, true)

        return this.accountBalanceRepository.findSeries(
            financialAccountId,
            from ? new Date(from) : undefined,
            to ? new Date(to) : undefined
        )
    }

    /**
     * Rebuilds the dense daily balance series forward from a changed baseline point after a retroactive edit
     * (a backdated manual anchor or a past transaction). Every calendar day strictly after the baseline up to
     * the next manual anchor (exclusive) — or up to and including today when no later anchor exists — gets a
     * point equal to the previous day's balance plus that day's net transaction delta. Manual anchors are
     * ground truth and are never recomputed, so they bound the walk. Existing points are upserted in place to
     * preserve their ids and keep snapshot links intact. Does not refresh snapshots itself: single-account
     * callers refresh them directly afterwards, multi-account callers refresh once via
     * {@link recomputeAccountsAndSnapshots} instead of racing a refresh per account.
     * @param actualBalance The just-upserted baseline point the daily walk carries forward from.
     * @returns A promise that resolves when the forward daily series has been rebuilt.
     */
    async recomputeBalances(actualBalance: FinancialAccountBalanceData): Promise<void> {
        const userId = this.context.currentUser.id
        const { financialAccountId } = actualBalance
        const fromDate = normalizeDate(actualBalance.date)

        // Stop boundary: the first manual anchor after the baseline (ground truth, never recomputed); when none
        // exists the series is filled up to and including today, hence the exclusive day-after-today bound.
        const nextManualAnchor = await this.accountBalanceRepository.findNextManualAnchorAfter(
            financialAccountId,
            fromDate
        )
        const endExclusive = nextManualAnchor
            ? normalizeDate(nextManualAnchor.date)
            : addUtcDays(normalizeDate(new Date()), 1)

        if (addUtcDays(fromDate, 1) >= endExclusive) {
            return
        }

        // One read for every transaction strictly between the baseline day and the boundary, bucketed per
        // calendar day so the daily walk needs no per-day query. Transactions dated on the baseline day fall
        // outside the walked range and are already reflected in the baseline balance.
        const dailyAmounts = await this.accountBalanceRepository.findSignedDailyAmounts(
            financialAccountId,
            userId,
            fromDate,
            endExclusive
        )
        const deltaByDay = new Map<string, Prisma.Decimal>()
        for (const { date, delta } of dailyAmounts) {
            const key = normalizeDate(date).toISOString()
            deltaByDay.set(key, (deltaByDay.get(key) ?? new Prisma.Decimal(0)).add(delta))
        }

        // Carry the baseline forward one day at a time so each day equals the previous day plus its movements.
        const points: { date: Date; balance: number }[] = []
        let runningBalance = new Prisma.Decimal(actualBalance.balance)
        for (let cursor = addUtcDays(fromDate, 1); cursor < endExclusive; cursor = addUtcDays(cursor, 1)) {
            runningBalance = runningBalance.add(deltaByDay.get(cursor.toISOString()) ?? new Prisma.Decimal(0))
            points.push({ date: cursor, balance: runningBalance.toNumber() })
        }

        await this.accountBalanceRepository.upsertComputedPoints(financialAccountId, points)
    }

    /**
     * Rebuilds the daily balance series of an account after a transaction was created, edited or deleted on a day.
     * Points strictly before the changed day are unaffected, so the latest earlier point seeds the dense forward
     * walk; when the account has no earlier point the series is seeded from a zero balance the day before, matching
     * the zero fallback of the live-balance view. Delegates the forward walk to {@link recomputeBalances}.
     * @param financialAccountId The financial account whose series is rebuilt.
     * @param fromDate The earliest day impacted by the transaction change.
     * @returns A promise that resolves when the series has been rebuilt.
     */
    async recomputeFromTransactionChange(financialAccountId: string, fromDate: Date): Promise<void> {
        const day = normalizeDate(fromDate)
        const previousPoint = await this.accountBalanceRepository.findLatestPointBefore(financialAccountId, day)

        const baseline: FinancialAccountBalanceData = previousPoint
            ? {
                  financialAccountId,
                  date: normalizeDate(previousPoint.date).toISOString(),
                  balance: previousPoint.balance,
                  isManual: previousPoint.isManual,
                  note: null
              }
            : {
                  financialAccountId,
                  date: addUtcDays(day, -1).toISOString(),
                  balance: 0,
                  isManual: false,
                  note: null
              }

        await this.recomputeBalances(baseline)
    }

    /**
     * Rebuilds the daily balance series of every distinct account touched by a transaction-driven change (standard
     * create/update/delete, transfer, or import approve/rollback/delete), then refreshes the user's snapshots
     * exactly once for the whole change. Recomputing each account's series can run in parallel since they write
     * disjoint rows, but the snapshot refresh must run once overall: it upserts and totals shared snapshot rows,
     * so calling it per account would race concurrent writes to the same rows.
     * @param financialAccountIds The financial accounts touched by the change; duplicates are ignored.
     * @param fromDate The earliest date impacted by the change.
     * @returns A promise that resolves once every affected account's series and the user's snapshots have been rebuilt.
     */
    async recomputeAccountsAndSnapshots(financialAccountIds: string[], fromDate: Date): Promise<void> {
        const userId = this.context.currentUser.id

        await Promise.all(
            Array.from(new Set(financialAccountIds)).map(financialAccountId =>
                this.recomputeFromTransactionChange(financialAccountId, fromDate)
            )
        )

        await this.snapshotService.refreshSnapshotsFrom(userId, normalizeDate(fromDate))
    }
}
