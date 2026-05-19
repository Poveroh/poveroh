import prisma, { Prisma } from '@poveroh/prisma'

const snapshotWithDetailsInclude = {
    accountBalances: true,
    assetValues: true
} satisfies Prisma.SnapshotInclude

type SnapshotWithDetails = Prisma.SnapshotGetPayload<{ include: typeof snapshotWithDetailsInclude }>

export class SnapshotRepository {
    /**
     * Finds an active financial account by id and owning user, returning the account id when it exists.
     * @param userId The ID of the user who owns the financial account.
     * @param accountId The unique identifier of the financial account to retrieve.
     * @returns A promise that resolves to an object containing the account id, or null if no account is found.
     */
    async findAccountById(userId: string, accountId: string): Promise<{ id: string } | null> {
        return prisma.financialAccount.findFirst({
            where: { id: accountId, userId },
            select: { id: true }
        })
    }

    /**
     * Upserts a snapshot row identified by user and snapshot date, creating an empty snapshot when none exists.
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
                snapshotDate,
                totalCash: 0,
                totalInvestments: 0,
                totalNetWorth: 0
            }
        })
    }

    /**
     * Upserts the balance row for the specified snapshot and financial account, applying the provided balance value.
     * @param snapshotId The unique identifier of the snapshot the balance belongs to.
     * @param accountId The unique identifier of the financial account the balance refers to.
     * @param balance The balance value to be persisted for the snapshot account.
     * @returns A promise that resolves when the snapshot account balance has been upserted.
     */
    async upsertAccountBalance(snapshotId: string, accountId: string, balance: number): Promise<void> {
        await prisma.snapshotAccountBalance.upsert({
            where: {
                snapshotId_accountId: {
                    snapshotId,
                    accountId
                }
            },
            update: { balance },
            create: {
                snapshotId,
                accountId,
                balance
            }
        })
    }

    /**
     * Recomputes the snapshot totals by aggregating its account balances and persists the new totals on the snapshot row.
     * @param snapshotId The unique identifier of the snapshot whose totals must be refreshed.
     * @returns A promise that resolves when the snapshot totals have been updated.
     */
    async refreshSnapshotTotals(snapshotId: string): Promise<void> {
        const aggregate = await prisma.snapshotAccountBalance.aggregate({
            where: { snapshotId },
            _sum: { balance: true }
        })

        const totalCash = aggregate._sum.balance ?? 0

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
     * Finds the most recent snapshot account balance row for the specified financial account ordered by snapshot date in descending order.
     * @param accountId The unique identifier of the financial account whose latest snapshot is being retrieved.
     * @returns A promise that resolves to the latest snapshot account balance enriched with the snapshot date, or null if none exists.
     */
    async findLatestSnapshotForAccount(accountId: string) {
        return prisma.snapshotAccountBalance.findFirst({
            where: { accountId },
            include: { snapshot: { select: { snapshotDate: true } } },
            orderBy: { snapshot: { snapshotDate: 'desc' } }
        })
    }

    /**
     * Updates the cached balance of a financial account so it reflects the latest reconciled snapshot value.
     * @param accountId The unique identifier of the financial account being updated.
     * @param balance The balance value to persist on the financial account.
     * @returns A promise that resolves when the financial account balance has been updated.
     */
    async updateAccountBalance(accountId: string, balance: number): Promise<void> {
        await prisma.financialAccount.update({
            where: { id: accountId },
            data: { balance }
        })
    }

    /**
     * Retrieves a snapshot including its account balances and asset values, throwing when no record matches the supplied id.
     * @param snapshotId The unique identifier of the snapshot to retrieve.
     * @returns A promise that resolves to the snapshot enriched with account balances and asset values.
     */
    async findSnapshotWithDetails(snapshotId: string): Promise<SnapshotWithDetails> {
        return prisma.snapshot.findUniqueOrThrow({
            where: { id: snapshotId },
            include: snapshotWithDetailsInclude
        })
    }
}
