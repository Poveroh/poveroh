import prisma from '@poveroh/prisma'

export class SnapshotRepository {
    /**
     * Lists the ids of every active financial account owned by a user, used to link the per-account balances of a snapshot.
     * @param userId The ID of the user who owns the financial accounts.
     * @returns A promise that resolves to the active account ids.
     */
    async findActiveAccountIds(userId: string): Promise<{ id: string }[]> {
        return prisma.financialAccount.findMany({
            where: { userId, deletedAt: null },
            select: { id: true }
        })
    }

    /**
     * Lists every user's snapshot frequency preference, used by the daily scheduler to decide whose snapshot is due.
     * @returns A promise resolving to the userId and configured snapshot frequency of each user.
     */
    async findUserSnapshotFrequencies() {
        return prisma.userPreferences.findMany({
            select: { userId: true, snapshotFrequency: true }
        })
    }

    /**
     * Upserts a snapshot row identified by user and snapshot date, creating an empty marker when none exists.
     * @param userId The ID of the user who owns the snapshot.
     * @param snapshotDate The snapshot date used as part of the unique constraint to upsert.
     * @returns A promise that resolves to the upserted snapshot row.
     */
    async upsertSnapshot(userId: string, snapshotDate: string) {
        return prisma.snapshot.upsert({
            where: {
                userId_snapshotDate: {
                    userId,
                    snapshotDate
                }
            },
            update: {},
            create: {
                userId,
                snapshotDate
            }
        })
    }

    /**
     * Lists the snapshots of a user on or after a date, used to refresh the cached totals affected by a retroactive balance change.
     * @param userId The ID of the user who owns the snapshots.
     * @param fromDate The inclusive lower bound date.
     * @returns A promise resolving to the affected snapshots' id and date, ordered ascending.
     */
    async findSnapshotsFromDate(userId: string, fromDate: Date): Promise<{ id: string; snapshotDate: Date }[]> {
        return prisma.snapshot.findMany({
            where: { userId, deletedAt: null, snapshotDate: { gte: fromDate } },
            select: { id: true, snapshotDate: true },
            orderBy: { snapshotDate: 'asc' }
        })
    }

    /**
     * Recomputes and stores a snapshot's cached net-worth totals by summing the balances linked to it.
     * @param snapshotId The unique identifier of the snapshot whose cached totals are refreshed.
     * @returns A promise that resolves when the cached totals have been updated.
     */
    async refreshTotalsFromLinks(snapshotId: string): Promise<void> {
        const links = await prisma.snapshotAccountBalance.findMany({
            where: { snapshotId, deletedAt: null },
            select: { financialAccountBalance: { select: { balance: true } } }
        })

        const totalCash = links.reduce((sum, link) => sum + Number(link.financialAccountBalance?.balance ?? 0), 0)

        await prisma.snapshot.update({
            where: { id: snapshotId },
            data: {
                totalCash,
                totalInvestments: 0,
                totalNetWorth: totalCash
            }
        })
    }

    /**
     * Links a snapshot to the balance point of a financial account for that snapshot, referencing the FinancialAccountBalance row instead of copying its value.
     * @param snapshotId The unique identifier of the snapshot the link belongs to.
     * @param accountId The unique identifier of the financial account being linked.
     * @param financialAccountBalanceId The id of the FinancialAccountBalance row effective at the snapshot date, or null when the account has no balance point yet.
     * @returns A promise that resolves when the link has been upserted.
     */
    async upsertAccountBalanceLink(
        snapshotId: string,
        accountId: string,
        financialAccountBalanceId: string | null
    ): Promise<void> {
        await prisma.snapshotAccountBalance.upsert({
            where: {
                snapshotId_accountId: {
                    snapshotId,
                    accountId
                }
            },
            update: { financialAccountBalanceId },
            create: {
                snapshotId,
                accountId,
                financialAccountBalanceId
            }
        })
    }
}
