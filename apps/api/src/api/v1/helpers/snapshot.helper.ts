import prisma from '@poveroh/prisma'

// Function to recalculate the balances of subsequent snapshots
export async function recalculateSubsequentSnapshots(
    accountId: string,
    fromDate: string,
    newBalance: number,
    userId: string
) {
    // Find all subsequent snapshots
    const subsequentSnapshots = await prisma.snapshotAccountBalance.findMany({
        where: {
            accountId,
            snapshot: {
                snapshotDate: { gt: new Date(fromDate) },
                userId
            }
        },
        include: { snapshot: true },
        orderBy: { snapshot: { snapshotDate: 'asc' } }
    })

    let currentBalance = newBalance
    let lastDate = new Date(fromDate)

    for (const snap of subsequentSnapshots) {
        // Sum transactions between lastDate and snap.snapshotDate
        const incomeSum = await prisma.amount.aggregate({
            where: {
                financialAccountId: accountId,
                transaction: {
                    date: { gt: lastDate, lte: snap.snapshot.snapshotDate },
                    userId,
                    action: 'INCOME'
                }
            },
            _sum: { amount: true }
        })

        const expenseSum = await prisma.amount.aggregate({
            where: {
                financialAccountId: accountId,
                transaction: {
                    date: { gt: lastDate, lte: snap.snapshot.snapshotDate },
                    userId,
                    action: 'EXPENSES'
                }
            },
            _sum: { amount: true }
        })

        const delta = (incomeSum._sum.amount?.toNumber() ?? 0) - (expenseSum._sum.amount?.toNumber() ?? 0)
        currentBalance += delta

        // Update the balance
        await prisma.snapshotAccountBalance.update({
            where: { id: snap.id },
            data: { balance: currentBalance }
        })

        // Recalculate totals for this snapshot
        const aggregate = await prisma.snapshotAccountBalance.aggregate({
            where: { snapshotId: snap.snapshotId },
            _sum: { balance: true }
        })

        const totalCash = aggregate._sum.balance ?? 0

        await prisma.snapshot.update({
            where: { id: snap.snapshotId },
            data: {
                totalCash,
                totalInvestments: 0,
                totalNetWorth: totalCash
            }
        })

        lastDate = snap.snapshot.snapshotDate
    }
}
