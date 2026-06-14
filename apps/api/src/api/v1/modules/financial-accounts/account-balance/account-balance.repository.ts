import prisma, { Prisma } from '@poveroh/prisma'
import type { FinancialAccountBalanceData } from '@poveroh/types'

const accountBalanceSelect = {
    id: true,
    financialAccountId: true,
    date: true,
    balance: true,
    note: true,
    isManual: true
} satisfies Prisma.FinancialAccountBalanceSelect

type AccountBalanceRow = Prisma.FinancialAccountBalanceGetPayload<{ select: typeof accountBalanceSelect }>

export class AccountBalanceRepository {
    /**
     * Maps a database balance row to the API DTO, converting the Decimal balance and Date to plain JSON values.
     * @param row The database financial account balance row to map.
     * @returns The financial account balance data exposed by the API.
     */
    private toData(row: AccountBalanceRow): FinancialAccountBalanceData {
        return {
            financialAccountId: row.financialAccountId,
            date: row.date.toISOString(),
            balance: row.balance.toNumber(),
            isManual: row.isManual,
            note: row.note
        }
    }

    /**
     * Upserts the balance point of a financial account at a given date, restoring soft-deleted rows.
     * @param financialAccountId The financial account the balance point belongs to.
     * @param date The date of the balance point (used together with the account id as the unique key).
     * @param balance The balance value to persist.
     * @param isManual Whether the point is a manual reconciliation anchor or a transaction-derived point.
     * @param note An optional note attached to the balance point.
     * @param tx An optional Prisma transaction client to run within an existing transaction.
     * @returns A promise that resolves when the balance point has been upserted.
     */
    async upsertBalance(
        financialAccountId: string,
        date: Date,
        balance: number,
        isManual: boolean,
        note?: string | null,
        tx?: Prisma.TransactionClient
    ): Promise<void> {
        const db = tx ?? prisma
        await db.financialAccountBalance.upsert({
            where: { financialAccountId_date: { financialAccountId, date } },
            update: { balance, isManual, note: note ?? null, deletedAt: null },
            create: { financialAccountId, date, balance, isManual, note: note ?? null }
        })
    }

    /**
     * Reads the most recent balance value of a financial account at or before the given date.
     * @param financialAccountId The financial account whose balance is read.
     * @param date The upper bound date (inclusive) used to find the as-of balance.
     * @returns A promise resolving to the as-of balance value, or null when no point exists up to the date.
     */
    async balanceAsOf(financialAccountId: string, date: Date): Promise<number | null> {
        const row = await prisma.financialAccountBalance.findFirst({
            where: { financialAccountId, deletedAt: null, date: { lte: date } },
            orderBy: { date: 'desc' },
            select: { balance: true }
        })
        return row ? row.balance.toNumber() : null
    }

    /**
     * Reads the id of the most recent balance point of a financial account at or before the given date, used to link a snapshot to its source row.
     * @param financialAccountId The financial account whose balance point is read.
     * @param date The upper bound date (inclusive).
     * @returns A promise resolving to the balance point id, or null when none exists up to the date.
     */
    async findBalanceIdAsOf(financialAccountId: string, date: Date): Promise<string | null> {
        const row = await prisma.financialAccountBalance.findFirst({
            where: { financialAccountId, deletedAt: null, date: { lte: date } },
            orderBy: { date: 'desc' },
            select: { id: true }
        })
        return row?.id ?? null
    }

    /**
     * Reads the balance time-series of a financial account within an optional date range, ordered ascending by date.
     * @param financialAccountId The financial account whose series is read.
     * @param from An optional inclusive lower bound date.
     * @param to An optional inclusive upper bound date.
     * @returns A promise resolving to the ordered list of balance points.
     */
    async findSeries(financialAccountId: string, from?: Date, to?: Date): Promise<FinancialAccountBalanceData[]> {
        const rows = await prisma.financialAccountBalance.findMany({
            where: {
                financialAccountId,
                deletedAt: null,
                ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {})
            },
            select: accountBalanceSelect,
            orderBy: { date: 'asc' }
        })
        return rows.map(row => this.toData(row))
    }

    /**
     * Reads all balance points strictly after the given date, ordered ascending, used to recompute the series forward.
     * @param financialAccountId The financial account whose forward points are read.
     * @param fromDate The exclusive lower bound date.
     * @returns A promise resolving to the forward points with the fields required by the recompute walk.
     */
    async findForwardRows(financialAccountId: string, fromDate: Date) {
        return prisma.financialAccountBalance.findMany({
            where: { financialAccountId, deletedAt: null, date: { gt: fromDate } },
            orderBy: { date: 'asc' },
            select: { id: true, date: true, balance: true, isManual: true }
        })
    }

    /**
     * Reads the latest manual balance anchor at or before the given date.
     * @param financialAccountId The financial account whose anchor is read.
     * @param date The upper bound date (inclusive).
     * @returns A promise resolving to the latest manual anchor, or null when none exists.
     */
    async findLatestManualAnchorOnOrBefore(financialAccountId: string, date: Date) {
        return prisma.financialAccountBalance.findFirst({
            where: { financialAccountId, deletedAt: null, isManual: true, date: { lte: date } },
            orderBy: { date: 'desc' },
            select: { date: true, balance: true }
        })
    }

    /**
     * Updates the balance value of an existing balance point.
     * @param id The id of the balance point to update.
     * @param balance The new balance value.
     * @param tx An optional Prisma transaction client to run within an existing transaction.
     * @returns A promise that resolves when the point has been updated.
     */
    async updateBalance(id: string, balance: number, tx?: Prisma.TransactionClient): Promise<void> {
        const db = tx ?? prisma
        await db.financialAccountBalance.update({ where: { id }, data: { balance } })
    }

    /**
     * Sums the signed amount delta (income minus expenses) applied to an account by transactions whose date falls in an exclusive-inclusive window.
     * @param financialAccountId The financial account whose amounts are aggregated.
     * @param userId The owning user, used to scope the underlying transactions.
     * @param after The exclusive lower bound date of the transactions.
     * @param until The inclusive upper bound date of the transactions.
     * @returns A promise resolving to the net balance delta for the window.
     */
    async sumAmountDelta(financialAccountId: string, userId: string, after: Date, until: Date): Promise<number> {
        const window = { gt: after, lte: until }
        const [income, expense] = await Promise.all([
            prisma.amount.aggregate({
                where: {
                    financialAccountId,
                    action: 'INCOME',
                    deletedAt: null,
                    transaction: { userId, deletedAt: null, date: window }
                },
                _sum: { amount: true }
            }),
            prisma.amount.aggregate({
                where: {
                    financialAccountId,
                    action: 'EXPENSES',
                    deletedAt: null,
                    transaction: { userId, deletedAt: null, date: window }
                },
                _sum: { amount: true }
            })
        ])
        return (income._sum.amount?.toNumber() ?? 0) - (expense._sum.amount?.toNumber() ?? 0)
    }

    /**
     * Lists the ids of every user that owns at least one active (non soft-deleted) financial account, used to drive the daily materialization sweep per user.
     * @returns A promise resolving to the distinct owning user ids.
     */
    async findUserIdsWithActiveAccounts(): Promise<string[]> {
        const rows = await prisma.financialAccount.findMany({
            where: { deletedAt: null },
            select: { userId: true },
            distinct: ['userId']
        })
        return rows.map(row => row.userId)
    }

    /**
     * Lists the active (non soft-deleted) financial accounts owned by a user with their live balance, used by the daily materialization sweep.
     * @param userId The owning user whose active accounts are read.
     * @returns A promise resolving to the user's active accounts with their id and live balance.
     */
    async findActiveAccountsByUser(userId: string): Promise<{ id: string; balance: Prisma.Decimal }[]> {
        return prisma.financialAccount.findMany({
            where: { userId, deletedAt: null },
            select: { id: true, balance: true }
        })
    }

    /**
     * Finds the anchor to start a forward recompute from after a retroactive change: the latest balance point strictly before the changed day, falling back to the earliest point when the change predates the series.
     * @param financialAccountId The financial account whose anchor is read.
     * @param day The changed day; the anchor must be unaffected by a change dated on or after it.
     * @returns A promise resolving to the anchor date and balance, or null when the account has no balance point.
     */
    async findRecomputeAnchor(financialAccountId: string, day: Date): Promise<{ date: Date; balance: number } | null> {
        const before = await prisma.financialAccountBalance.findFirst({
            where: { financialAccountId, deletedAt: null, date: { lt: day } },
            orderBy: { date: 'desc' },
            select: { date: true, balance: true }
        })
        if (before) {
            return { date: before.date, balance: before.balance.toNumber() }
        }

        const earliest = await prisma.financialAccountBalance.findFirst({
            where: { financialAccountId, deletedAt: null },
            orderBy: { date: 'asc' },
            select: { date: true, balance: true }
        })
        return earliest ? { date: earliest.date, balance: earliest.balance.toNumber() } : null
    }

    /**
     * Reads the latest balance point strictly before a date, used as the running baseline when backfilling a daily series.
     * @param financialAccountId The financial account whose baseline point is read.
     * @param date The exclusive upper bound date.
     * @returns A promise resolving to the latest point's date and balance, or null when no earlier point exists.
     */
    async findLatestPointBefore(
        financialAccountId: string,
        date: Date
    ): Promise<{ date: Date; balance: number } | null> {
        const row = await prisma.financialAccountBalance.findFirst({
            where: { financialAccountId, deletedAt: null, date: { lt: date } },
            orderBy: { date: 'desc' },
            select: { date: true, balance: true }
        })
        return row ? { date: row.date, balance: row.balance.toNumber() } : null
    }

    /**
     * Reads the balance points of a financial account within an inclusive date range, used to preserve manual anchors and skip unchanged points while backfilling.
     * @param financialAccountId The financial account whose points are read.
     * @param from The inclusive lower bound date.
     * @param to The inclusive upper bound date.
     * @returns A promise resolving to the points in range with the fields required by the backfill walk.
     */
    async findPointsInRange(
        financialAccountId: string,
        from: Date,
        to: Date
    ): Promise<{ date: Date; balance: Prisma.Decimal; isManual: boolean }[]> {
        return prisma.financialAccountBalance.findMany({
            where: { financialAccountId, deletedAt: null, date: { gte: from, lte: to } },
            select: { date: true, balance: true, isManual: true }
        })
    }

    /**
     * Reads the signed balance effect (income positive, expenses negative) of every amount applied to an account by the user's transactions dated in an exclusive-exclusive window, tagged with the transaction date so the caller can bucket them per day.
     * @param financialAccountId The financial account whose amounts are read.
     * @param userId The owning user, used to scope the underlying transactions.
     * @param after The exclusive lower bound date of the transactions.
     * @param until The exclusive upper bound date of the transactions.
     * @returns A promise resolving to the per-amount signed deltas with their transaction date.
     */
    async findSignedDailyAmounts(
        financialAccountId: string,
        userId: string,
        after: Date,
        until: Date
    ): Promise<{ date: Date; delta: number }[]> {
        const rows = await prisma.amount.findMany({
            where: {
                financialAccountId,
                deletedAt: null,
                transaction: { userId, deletedAt: null, date: { gt: after, lt: until } }
            },
            select: { amount: true, action: true, transaction: { select: { date: true } } }
        })
        return rows.map(row => ({
            date: row.transaction.date,
            delta:
                row.action === 'INCOME' ? row.amount.toNumber() : row.action === 'EXPENSES' ? -row.amount.toNumber() : 0
        }))
    }

    /**
     * Reads the balance point of a financial account at an exact date, used to avoid overwriting manual anchors during materialization.
     * @param financialAccountId The financial account the point belongs to.
     * @param date The exact date of the point.
     * @returns A promise resolving to the point's manual flag, or null when no point exists at that date.
     */
    async findByDate(financialAccountId: string, date: Date): Promise<{ isManual: boolean } | null> {
        return prisma.financialAccountBalance.findUnique({
            where: { financialAccountId_date: { financialAccountId, date } },
            select: { isManual: true }
        })
    }

    /**
     * Persists the live running balance on the financial account record.
     * @param financialAccountId The financial account to update.
     * @param balance The live balance value to persist.
     * @param tx An optional Prisma transaction client to run within an existing transaction.
     * @returns A promise that resolves when the account balance has been updated.
     */
    async updateAccountLiveBalance(
        financialAccountId: string,
        balance: number,
        tx?: Prisma.TransactionClient
    ): Promise<void> {
        const db = tx ?? prisma
        await db.financialAccount.update({ where: { id: financialAccountId }, data: { balance } })
    }
}
