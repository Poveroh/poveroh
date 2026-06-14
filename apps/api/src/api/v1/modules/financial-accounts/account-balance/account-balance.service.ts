import prisma, { Prisma } from '@poveroh/prisma'
import type {
    Amount,
    CreateFinancialAccountBalanceRequest,
    FinancialAccountBalanceData,
    FinancialAccountData
} from '@poveroh/types'
import { NotFoundError } from '@/utils'
import { RedisHelper } from '@poveroh/redis'
import { BaseService } from '../../base/base.service'
import { AccountBalanceRepository } from './account-balance.repository'
import { FinancialAccountRepository } from '../financial-account.repository'
import { SnapshotService } from '../../snapshots/snapshot.service'
import { eventBus } from '../../../events/event-bus'
import { addUtcDays, startOfUtcDay } from '@/utils/date'

export class AccountBalanceService extends BaseService {
    private readonly accountBalanceRepository = new AccountBalanceRepository()
    private readonly financialAccountRepository = new FinancialAccountRepository()
    private readonly snapshotService = new SnapshotService()

    constructor() {
        super('account-balance')
    }

    /**
     * Records a manual balance anchor for a financial account at a date, recomputes the subsequent series and the live balance, and returns the updated account.
     * @param payload The manual balance data, including the financial account id, the balance, the date and an optional note.
     * @returns A promise resolving to the updated financial account data.
     */
    async addManualBalance(payload: CreateFinancialAccountBalanceRequest): Promise<FinancialAccountData> {
        const userId = this.context.currentUser.id
        const { financialAccountId, balance, note } = payload

        const account = await this.financialAccountRepository.findById(userId, financialAccountId)
        if (!account) {
            throw new NotFoundError('Financial account not found')
        }

        const parsedBalance = Number(balance)
        const date = startOfUtcDay(new Date(payload.date))

        await this.accountBalanceRepository.upsertBalance(financialAccountId, date, parsedBalance, true, note ?? null)
        await this.recomputeForwardBalances(financialAccountId, date, parsedBalance, userId)

        // Refresh the cached net-worth totals of the snapshots impacted by this retroactive change.
        await this.snapshotService.refreshSnapshotsFrom(userId, financialAccountId, date)

        const updated = await this.financialAccountRepository.findById(userId, financialAccountId)
        if (!updated) {
            throw new NotFoundError('Financial account not found')
        }

        await eventBus.emit('financial-account.updated', { userId, data: updated })

        return updated
    }

    /**
     * Recomputes the materialized balance series and live balance of an account from a date forward and refreshes the snapshots affected, so a retroactive transaction change (amount, type, account or date) flows into the historical series and net-worth snapshots.
     * @param financialAccountId The financial account whose series is recomputed.
     * @param userId The owning user, used to scope transactions and snapshots.
     * @param fromDate The earliest date impacted by the change.
     * @returns A promise that resolves when the series, live balance and snapshots have been refreshed.
     */
    async recomputeFromTransactionChange(financialAccountId: string, userId: string, fromDate: Date): Promise<void> {
        const day = startOfUtcDay(fromDate)

        // Anchor on the last known-good point before the changed day (unaffected by a change dated on/after it),
        // then re-walk the series forward. Skip when the account has no materialized point yet: the live balance
        // is already kept correct incrementally by applyAmounts.
        const anchor = await this.accountBalanceRepository.findRecomputeAnchor(financialAccountId, day)
        if (anchor) {
            await this.recomputeForwardBalances(financialAccountId, anchor.date, anchor.balance, userId)
        }

        await this.snapshotService.refreshSnapshotsFrom(userId, financialAccountId, day)
    }

    /**
     * Reads the balance time-series of a financial account owned by the current user within an optional date range.
     * @param financialAccountId The financial account whose series is requested.
     * @param from An optional inclusive lower bound date (ISO string).
     * @param to An optional inclusive upper bound date (ISO string).
     * @returns A promise resolving to the ordered balance points used to build the chart.
     */
    async getSeries(financialAccountId: string, from?: string, to?: string): Promise<FinancialAccountBalanceData[]> {
        const userId = this.context.currentUser.id

        const account = await this.financialAccountRepository.findById(userId, financialAccountId)
        if (!account) {
            throw new NotFoundError('Financial account not found')
        }

        return this.accountBalanceRepository.findSeries(
            financialAccountId,
            from ? new Date(from) : undefined,
            to ? new Date(to) : undefined
        )
    }

    /**
     * Materializes one transaction-derived balance point per active account for a given day, iterating per user and snapshotting each account's live balance without overwriting existing manual anchors.
     * @param date An optional ISO date for the day to materialize; defaults to today.
     * @returns A promise resolving to the number of accounts materialized.
     */
    async materializeDaily(date?: string): Promise<number> {
        const day = startOfUtcDay(date ? new Date(date) : new Date())
        const userIds = await this.accountBalanceRepository.findUserIdsWithActiveAccounts()

        let count = 0
        // Sweep per user so account access stays scoped by ownership, never assuming a single global account pool.
        for (const userId of userIds) {
            const accounts = await this.accountBalanceRepository.findActiveAccountsByUser(userId)

            for (const account of accounts) {
                const existing = await this.accountBalanceRepository.findByDate(account.id, day)
                if (existing?.isManual) {
                    continue
                }

                await this.accountBalanceRepository.upsertBalance(account.id, day, account.balance.toNumber(), false)
                count++
            }
        }

        return count
    }

    /**
     * Reads the live running balance of a financial account, using the Redis cache when available and falling back to the database.
     * @param financialAccountId The financial account whose balance is read.
     * @param tx An optional Prisma transaction client to read within an existing transaction.
     * @returns A promise resolving to the live balance as a Decimal.
     */
    async getAccountBalance(financialAccountId: string, tx?: Prisma.TransactionClient): Promise<Prisma.Decimal> {
        const cachedBalance = await RedisHelper.get(`balance:${financialAccountId}`)
        if (cachedBalance) {
            return new Prisma.Decimal(cachedBalance)
        }

        const account = await (tx ?? prisma).financialAccount.findUnique({
            where: { id: financialAccountId },
            select: { balance: true }
        })
        const balance = account?.balance

        if (!balance) {
            throw new Error('Account balance not found')
        }

        const decimalBalance = new Prisma.Decimal(balance)
        await RedisHelper.set(`balance:${financialAccountId}`, decimalBalance.toString(), 300)

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
        const db = tx ?? prisma

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

            await db.financialAccount.update({
                where: { id: accountId },
                data: { balance: newBalance }
            })

            await RedisHelper.set(`balance:${accountId}`, newBalance.toString())
        })

        await Promise.all(updatePromises)
    }

    /**
     * Backfills a continuous daily balance series for an account from a start day up to today, creating one transaction-derived point per day so a backdated transaction yields a full daily history instead of a single point. Manual anchors are preserved and reanchor the running balance, unchanged points are skipped, and the affected snapshots are refreshed. Runs after the transaction commit so it reads the persisted amounts.
     * @param financialAccountId The financial account whose daily series is backfilled.
     * @param userId The owning user, used to scope the transactions summed into each day.
     * @param fromDate The earliest day to materialize, normalized to the start of its UTC day.
     * @returns A promise that resolves when the daily series has been backfilled and the snapshots refreshed.
     */
    async backfillDailySeries(financialAccountId: string, userId: string, fromDate: Date): Promise<void> {
        const start = startOfUtcDay(fromDate)
        const today = startOfUtcDay(new Date())
        if (start.getTime() > today.getTime()) {
            return
        }

        // The latest point strictly before `start` already holds the balance at the end of its day, so the running
        // balance starts there (or at 0 when the account has no earlier point).
        const anchor = await this.accountBalanceRepository.findLatestPointBefore(financialAccountId, start)
        let running = anchor?.balance ?? 0

        // Sum each day's signed amounts once, bucketed by UTC day, instead of querying per day. Fetch from just
        // after the anchor day (whose balance is already folded into `running`) through the end of today.
        const fetchAfter = anchor ? addUtcDays(startOfUtcDay(anchor.date), 1) : new Date(0)
        const dailyAmounts = await this.accountBalanceRepository.findSignedDailyAmounts(
            financialAccountId,
            userId,
            fetchAfter,
            addUtcDays(today, 1)
        )
        const deltaByDay = new Map<number, number>()
        for (const row of dailyAmounts) {
            const key = startOfUtcDay(row.date).getTime()
            deltaByDay.set(key, (deltaByDay.get(key) ?? 0) + row.delta)
        }

        // Fold transactions that fall between the anchor day and `start` into the baseline so the first
        // materialized day starts from the correct running balance.
        for (const [time, delta] of deltaByDay) {
            if (time < start.getTime()) {
                running += delta
            }
        }

        // Preload existing points in range to preserve manual anchors and skip rewriting unchanged values.
        const existing = await this.accountBalanceRepository.findPointsInRange(financialAccountId, start, today)
        const pointByDay = new Map(existing.map(point => [startOfUtcDay(point.date).getTime(), point]))

        for (let day = start; day.getTime() <= today.getTime(); day = addUtcDays(day, 1)) {
            const key = day.getTime()
            const point = pointByDay.get(key)

            if (point?.isManual) {
                running = point.balance.toNumber()
                continue
            }

            running += deltaByDay.get(key) ?? 0

            if (point && point.balance.toNumber() === running) {
                continue
            }
            await this.accountBalanceRepository.upsertBalance(financialAccountId, day, running, false)
        }

        await this.snapshotService.refreshSnapshotsFrom(userId, financialAccountId, start)
    }

    /**
     * Recomputes the transaction-derived balance points after a date by walking forward from an anchor, snapping to later manual anchors, and refreshes the account live balance.
     * @param financialAccountId The financial account whose series is recomputed.
     * @param fromDate The anchor date the recompute starts from (its row is assumed already persisted).
     * @param anchorBalance The balance value at the anchor date.
     * @param userId The owning user, used to scope transactions.
     * @returns A promise that resolves when the forward series and the live balance have been updated.
     */
    private async recomputeForwardBalances(
        financialAccountId: string,
        fromDate: Date,
        anchorBalance: number,
        userId: string
    ): Promise<void> {
        const rows = await this.accountBalanceRepository.findForwardRows(financialAccountId, fromDate)

        let current = anchorBalance
        let lastDate = fromDate

        for (const row of rows) {
            if (row.isManual) {
                current = row.balance.toNumber()
                lastDate = row.date
                continue
            }

            const delta = await this.accountBalanceRepository.sumAmountDelta(
                financialAccountId,
                userId,
                lastDate,
                row.date
            )
            current += delta
            await this.accountBalanceRepository.updateBalance(row.id, current)
            lastDate = row.date
        }

        // The materialized series may stop before today, so fold in the transactions that happened
        // after the last point to keep FinancialAccount.balance (the live running balance) consistent.
        const tailDelta = await this.accountBalanceRepository.sumAmountDelta(
            financialAccountId,
            userId,
            lastDate,
            new Date()
        )
        await this.accountBalanceRepository.updateAccountLiveBalance(financialAccountId, current + tailDelta)
        await RedisHelper.delete(`balance:${financialAccountId}`)
    }
}
