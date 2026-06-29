import type {
    Amount,
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
     * Records a manual balance anchor for a financial account at a date, recomputes the subsequent series and the live balance, and returns the updated account.
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
     * Reads the live running balance of a financial account, using the Redis cache when available and falling back to the database.
     * @param financialAccountId The financial account whose balance is read.
     * @param tx An optional Prisma transaction client to read within an existing transaction.
     * @returns A promise resolving to the live balance as a Decimal.
     */
    async getAccountBalance(financialAccountId: string, tx?: Prisma.TransactionClient): Promise<Prisma.Decimal> {
        const cachedBalance = await this.redis.get(`balance:${financialAccountId}`)
        if (cachedBalance) {
            return new Prisma.Decimal(cachedBalance)
        }

        // if (!balance) {
        //     throw new Error('Account balance not found')
        // }

        const decimalBalance = new Prisma.Decimal(0)
        // const decimalBalance = new Prisma.Decimal(balance)
        // await this.redis.set(`balance:${financialAccountId}`, decimalBalance.toString(), 300)

        return decimalBalance
    }

    /**
     * Returns the signed balance effect of an amount: positive for income, negative for expenses, zero otherwise.
     * @param amount The amount whose signed balance effect is computed.
     * @returns The signed value as a Decimal.
     */
    private signedAmount(amount: Pick<Amount, 'amount' | 'action'>): Prisma.Decimal {
        const value = new Prisma.Decimal(amount.amount)
        if (amount.action === 'INCOME') {
            return value
        }
        if (amount.action === 'EXPENSES') {
            return value.negated()
        }
        return new Prisma.Decimal(0)
    }

    /**
     * Applies transaction amount deltas to the live running balance of each affected account, reverting the original amounts on their own account and action first when editing.
     * @param amounts The new transaction amounts to apply, each scoped to a financial account.
     * @param originalAmounts The previous amounts reverted before applying the new ones when editing; each carries its original account and action so type and account changes net out correctly.
     * @param tx An optional Prisma transaction client to run within an existing transaction.
     * @returns A promise that resolves when every affected account balance has been updated.
     */
    async applyAmounts(amounts: Amount[], originalAmounts?: Amount[], tx?: Prisma.TransactionClient): Promise<void> {
        // const db = tx ?? prisma

        // Accumulate a net signed delta per account: reverting an original amount backs out its original
        // signed effect on its original account, applying a new amount adds its signed effect on its new
        // account. Keeping the two phases separate makes type changes (INCOME↔EXPENSES) and account changes
        // net out correctly instead of being computed against the new amount's action.
        const deltaByAccount = new Map<string, Prisma.Decimal>()
        const addDelta = (accountId: string, value: Prisma.Decimal) => {
            deltaByAccount.set(accountId, (deltaByAccount.get(accountId) ?? new Prisma.Decimal(0)).add(value))
        }

        for (const original of originalAmounts ?? []) {
            addDelta(original.financialAccountId, this.signedAmount(original).negated())
        }
        for (const amount of amounts) {
            addDelta(amount.financialAccountId, this.signedAmount(amount))
        }

        const updatePromises = Array.from(deltaByAccount.entries()).map(async ([accountId, delta]) => {
            const currentBalance = await this.getAccountBalance(accountId, tx)
            const newBalance = new Prisma.Decimal(currentBalance).add(delta)

            // await db.financialAccount.update({
            //     where: { id: accountId },
            //     data: { balance: newBalance }
            // })

            await this.redis.set(`balance:${accountId}`, newBalance.toString())
        })

        await Promise.all(updatePromises)
    }

    /**
     * Rebuilds the dense daily balance series forward from a changed baseline point after a retroactive edit
     * (a backdated manual anchor or a past transaction). Every calendar day strictly after the baseline up to
     * the next manual anchor (exclusive) — or up to and including today when no later anchor exists — gets a
     * point equal to the previous day's balance plus that day's net transaction delta. Manual anchors are
     * ground truth and are never recomputed, so they bound the walk. Existing points are upserted in place to
     * preserve their ids and keep snapshot links intact, the live-balance cache is invalidated, and the
     * snapshots from the baseline day forward are re-linked so cached net worth reflects the rebuilt series.
     * @param actualBalance The just-upserted baseline point the daily walk carries forward from.
     * @returns A promise that resolves when the forward daily series and the affected snapshots have been rebuilt.
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

        if (addUtcDays(fromDate, 1) < endExclusive) {
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

        await this.redis.delete(`balance:${financialAccountId}`)

        // Refresh the snapshots due on or after the baseline day so their cached net worth re-links to the rebuilt
        // series after a retroactive change, creating any missing past snapshot along the way.
        await this.snapshotService.refreshSnapshotsFrom(userId, fromDate)
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
}
