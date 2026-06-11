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

/**
 * Normalizes a date to midnight UTC so each balance point maps to a single calendar day.
 * @param date The date to normalize.
 * @returns A new Date set to 00:00:00.000 UTC of the same calendar day.
 */
function startOfUtcDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

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
     * Applies transaction amount deltas to the live running balance of each affected account, optionally reverting previous amounts first when editing.
     * @param amounts The transaction amounts to apply, each scoped to a financial account.
     * @param originalAmounts An optional map of transactionId to the previous amount value, reverted before applying the new amount when editing.
     * @param tx An optional Prisma transaction client to run within an existing transaction.
     * @returns A promise that resolves when every affected account balance has been updated.
     */
    async applyAmounts(
        amounts: Amount[],
        originalAmounts?: Map<string, number>,
        tx?: Prisma.TransactionClient
    ): Promise<void> {
        const db = tx ?? prisma
        const amountsArray = Array.isArray(amounts) ? amounts : [amounts]

        const amountsByAccount = amountsArray.reduce(
            (acc, amount) => {
                if (!acc[amount.financialAccountId]) {
                    acc[amount.financialAccountId] = []
                }
                acc[amount.financialAccountId].push(amount)
                return acc
            },
            {} as Record<string, Amount[]>
        )

        const updatePromises = Object.entries(amountsByAccount).map(async ([accountId, accountAmounts]) => {
            const currentBalance = await this.getAccountBalance(accountId, tx)
            let newBalance = new Prisma.Decimal(currentBalance)

            for (const amount of accountAmounts) {
                const originalAmount = originalAmounts?.get(amount.transactionId)
                if (originalAmount !== undefined) {
                    if (amount.action === 'INCOME') {
                        newBalance = newBalance.sub(new Prisma.Decimal(originalAmount))
                    } else if (amount.action === 'EXPENSES') {
                        newBalance = newBalance.add(new Prisma.Decimal(originalAmount))
                    }
                }

                if (amount.action === 'INCOME') {
                    newBalance = newBalance.add(new Prisma.Decimal(amount.amount))
                } else if (amount.action === 'EXPENSES') {
                    newBalance = newBalance.sub(new Prisma.Decimal(amount.amount))
                }
            }

            await db.financialAccount.update({
                where: { id: accountId },
                data: { balance: newBalance }
            })

            await RedisHelper.set(`balance:${accountId}`, newBalance.toString())
        })

        await Promise.all(updatePromises)
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
