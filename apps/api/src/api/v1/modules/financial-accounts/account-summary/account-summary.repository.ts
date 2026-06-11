import prisma from '@poveroh/prisma'

type AccountSummaryTotals = {
    totalIncome: number
    totalExpenses: number
    transactionCount: number
}

export class AccountSummaryRepository {
    /**
     * Aggregates the income, expenses and transaction count applied to an account by approved transactions within an optional date range.
     * @param financialAccountId The financial account whose amounts are aggregated.
     * @param userId The owning user, used to scope the underlying transactions.
     * @param from An optional inclusive lower bound date for the transactions.
     * @param to An optional inclusive upper bound date for the transactions.
     * @returns A promise resolving to the income total, expense total and transaction count for the period.
     */
    async getSummary(
        financialAccountId: string,
        userId: string,
        from?: Date,
        to?: Date
    ): Promise<AccountSummaryTotals> {
        const dateFilter = from || to ? { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } : undefined
        const transaction = {
            userId,
            deletedAt: null,
            status: 'APPROVED' as const,
            ...(dateFilter ? { date: dateFilter } : {})
        }

        const [income, expense] = await Promise.all([
            prisma.amount.aggregate({
                where: { financialAccountId, action: 'INCOME', deletedAt: null, transaction },
                _sum: { amount: true },
                _count: true
            }),
            prisma.amount.aggregate({
                where: { financialAccountId, action: 'EXPENSES', deletedAt: null, transaction },
                _sum: { amount: true },
                _count: true
            })
        ])

        return {
            totalIncome: income._sum.amount?.toNumber() ?? 0,
            totalExpenses: expense._sum.amount?.toNumber() ?? 0,
            transactionCount: income._count + expense._count
        }
    }
}
