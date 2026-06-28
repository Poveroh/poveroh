import prisma, { Prisma } from '@poveroh/prisma'
import type { CreateFinancialAccountBalanceRequest, FinancialAccountBalanceData } from '@poveroh/types'

const accountBalanceSelect = {
    id: true,
    financialAccountId: true,
    date: true,
    balance: true,
    note: true,
    isManual: true
} satisfies Prisma.FinancialAccountBalanceSelect

export class AccountBalanceRepository {
    /**
     * Upserts the balance point of a financial account at a given date, restoring soft-deleted rows.
     * @param payload The data for the balance point to upsert.
     * @param isManual A boolean indicating whether the balance point is manually entered or system-generated.
     * @param tx An optional Prisma transaction client to run within an existing transaction.
     * @returns A promise that resolves when the balance point has been upserted.
     */
    async upsertBalance(
        payload: CreateFinancialAccountBalanceRequest,
        isManual: boolean,
        tx?: Prisma.TransactionClient
    ) {
        const db = tx ?? prisma
        return (await db.financialAccountBalance.upsert({
            where: { financialAccountId_date: { financialAccountId: payload.financialAccountId, date: payload.date } },
            update: { balance: payload.balance, isManual, note: payload.note ?? null },
            create: {
                ...payload,
                isManual
            },
            select: accountBalanceSelect
        })) as unknown as FinancialAccountBalanceData
    }

    /**
     * Reads the balance time-series of a financial account within an optional date range, ordered ascending by date.
     * @param financialAccountId The financial account whose series is read.
     * @param from An optional inclusive lower bound date.
     * @param to An optional inclusive upper bound date.
     * @returns A promise resolving to the ordered list of balance points.
     */
    async findSeries(financialAccountId: string, from?: Date, to?: Date): Promise<FinancialAccountBalanceData[]> {
        return (await prisma.financialAccountBalance.findMany({
            where: {
                financialAccountId,

                ...(from || to ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {})
            },
            select: accountBalanceSelect,
            orderBy: { date: 'asc' }
        })) as unknown as FinancialAccountBalanceData[]
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

                    transaction: { userId, date: window }
                },
                _sum: { amount: true }
            }),
            prisma.amount.aggregate({
                where: {
                    financialAccountId,
                    action: 'EXPENSES',

                    transaction: { userId, date: window }
                },
                _sum: { amount: true }
            })
        ])
        return (income._sum.amount?.toNumber() ?? 0) - (expense._sum.amount?.toNumber() ?? 0)
    }

    /**
     * Reads the id of the most recent balance point of a financial account at or before the given date, used to link a snapshot to its source row.
     * @param financialAccountId The financial account whose balance point is read.
     * @param date The upper bound date (inclusive).
     * @returns A promise resolving to the balance point id, or null when none exists up to the date.
     */
    async findBalanceIdAsOf(financialAccountId: string, date: Date): Promise<string | null> {
        const row = await prisma.financialAccountBalance.findFirst({
            where: { financialAccountId, date: { lte: date } },
            orderBy: { date: 'desc' },
            select: { id: true }
        })
        return row?.id ?? null
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

                transaction: { userId, date: { gt: after, lt: until } }
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
     * Reads the latest balance point strictly before a date, used as the still-valid baseline to seed a forward recompute after a transaction change.
     * @param financialAccountId The financial account whose baseline point is read.
     * @param date The exclusive upper bound date.
     * @returns A promise resolving to the latest earlier point's date, balance and manual flag, or null when no earlier point exists.
     */
    async findLatestPointBefore(
        financialAccountId: string,
        date: Date
    ): Promise<{ date: Date; balance: number; isManual: boolean } | null> {
        const row = await prisma.financialAccountBalance.findFirst({
            where: { financialAccountId, date: { lt: date } },
            orderBy: { date: 'desc' },
            select: { date: true, balance: true, isManual: true }
        })
        return row ? { date: row.date, balance: row.balance.toNumber(), isManual: row.isManual } : null
    }

    /**
     * Reads the first manual balance anchor strictly after the given date, used as the exclusive stop boundary when rebuilding the daily series forward.
     * @param financialAccountId The financial account whose anchor is read.
     * @param date The exclusive lower bound date.
     * @returns A promise resolving to the next manual anchor's date, or null when none exists after the date.
     */
    async findNextManualAnchorAfter(financialAccountId: string, date: Date): Promise<{ date: Date } | null> {
        const row = await prisma.financialAccountBalance.findFirst({
            where: { financialAccountId, isManual: true, date: { gt: date } },
            orderBy: { date: 'asc' },
            select: { date: true }
        })
        return row ? { date: row.date } : null
    }

    /**
     * Upserts a batch of system-computed (non-manual) daily balance points in a single transaction, keeping existing point ids stable so snapshot links are preserved.
     * @param financialAccountId The financial account the points belong to.
     * @param points The daily points to upsert, each with its normalized date and balance.
     * @returns A promise that resolves when every point has been upserted.
     */
    async upsertComputedPoints(financialAccountId: string, points: { date: Date; balance: number }[]): Promise<void> {
        if (points.length === 0) {
            return
        }
        await prisma.$transaction(
            points.map(point =>
                prisma.financialAccountBalance.upsert({
                    where: { financialAccountId_date: { financialAccountId, date: point.date } },
                    update: { balance: point.balance, isManual: false },
                    create: { financialAccountId, date: point.date, balance: point.balance, isManual: false }
                })
            )
        )
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
            where: { financialAccountId, date: { gte: from, lte: to } },
            select: { date: true, balance: true, isManual: true }
        })
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
}
