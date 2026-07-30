import prisma from '@poveroh/prisma'
import type { CurrencyEnum, ValueSourceEnum } from '@poveroh/types'
import { normalizeDate } from '@/utils'

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
     * Lists the ids of every user who owns at least one active (non soft-deleted) financial account, used by the daily scheduler to know who needs a snapshot today.
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
     * Lists every active asset owned by a user together with its cached current valuation, used as the fallback value when freezing a snapshot's asset links.
     * @param userId The ID of the user who owns the assets.
     * @returns A promise that resolves to each active asset's id, quantity, current value, and currency.
     */
    async findActiveAssets(
        userId: string
    ): Promise<{ id: string; quantity: number; currentValue: number; currency: CurrencyEnum }[]> {
        const assets = await prisma.asset.findMany({
            where: { userId, deletedAt: null },
            select: { id: true, quantity: true, currentValue: true, currency: true }
        })

        return assets.map(asset => ({
            id: asset.id,
            quantity: asset.quantity.toNumber(),
            currentValue: asset.currentValue.toNumber(),
            currency: asset.currency
        }))
    }

    /**
     * Lists the asset ids already linked to a snapshot, used to avoid clobbering a more precise historical valuation (e.g. a market-synced daily price) already frozen for that day.
     * @param snapshotId The unique identifier of the snapshot whose existing asset links are read.
     * @returns A promise that resolves to the linked asset ids.
     */
    async findLinkedAssetIds(snapshotId: string): Promise<string[]> {
        const links = await prisma.snapshotAssetValue.findMany({
            where: { snapshotId, deletedAt: null, assetId: { not: null } },
            select: { assetId: true }
        })

        return links.map(link => link.assetId).filter((assetId): assetId is string => assetId !== null)
    }

    /**
     * Upserts a snapshot row identified by user and snapshot date, creating an empty marker when none exists.
     * @param userId The ID of the user who owns the snapshot.
     * @param snapshotDate The snapshot date as an ISO date string, normalized to midnight UTC before it is used as part of the unique constraint to upsert.
     * @returns A promise that resolves to the upserted snapshot row.
     */
    async upsertSnapshot(userId: string, snapshotDate: string) {
        const normalizedDate = normalizeDate(snapshotDate)

        return prisma.snapshot.upsert({
            where: {
                userId_snapshotDate: {
                    userId,
                    snapshotDate: normalizedDate
                }
            },
            update: {},
            create: {
                userId,
                snapshotDate: normalizedDate
            }
        })
    }

    /**
     * Recomputes and stores a snapshot's cached net-worth totals by summing the as-of balances linked to it.
     * @param snapshotId The unique identifier of the snapshot whose cached totals are refreshed.
     * @returns A promise that resolves when the cached totals have been updated.
     */
    async refreshTotalsFromLinks(snapshotId: string): Promise<void> {
        const [accountLinks, assetLinks] = await Promise.all([
            prisma.snapshotAccountBalance.findMany({
                where: { snapshotId, deletedAt: null },
                select: { financialAccountBalance: { select: { balance: true } } }
            }),
            prisma.snapshotAssetValue.findMany({
                where: { snapshotId, deletedAt: null },
                select: { totalValue: true }
            })
        ])

        const totalCash = accountLinks.reduce(
            (sum, link) => sum + Number(link.financialAccountBalance?.balance ?? 0),
            0
        )
        const totalInvestments = assetLinks.reduce((sum, link) => sum + Number(link.totalValue), 0)

        await prisma.snapshot.update({
            where: { id: snapshotId },
            data: {
                totalCash,
                totalInvestments,
                totalNetWorth: totalCash + totalInvestments
            }
        })
    }

    /**
     * Links a snapshot to an asset's valuation as-of the snapshot date, storing the quantity, unit price, and total value used to compute it.
     * @param snapshotId The unique identifier of the snapshot the link belongs to.
     * @param assetId The unique identifier of the asset being valued.
     * @param valuation The quantity held, unit price, and resulting total value, in the asset's own currency.
     * @returns A promise that resolves when the link has been upserted.
     */
    async upsertAssetValueLink(
        snapshotId: string,
        assetId: string,
        valuation: {
            quantity: number
            unitPrice: number
            totalValue: number
            currency: CurrencyEnum
            source: ValueSourceEnum
        }
    ): Promise<void> {
        const data = {
            quantity: valuation.quantity,
            unitPrice: valuation.unitPrice,
            totalValue: valuation.totalValue,
            originalCurrency: valuation.currency,
            source: valuation.source
        }

        await prisma.snapshotAssetValue.upsert({
            where: {
                snapshotId_assetId: {
                    snapshotId,
                    assetId
                }
            },
            update: data,
            create: {
                snapshotId,
                assetId,
                ...data
            }
        })
    }

    /**
     * Links a snapshot to the balance point of a financial account as-of the snapshot date, referencing the FinancialAccountBalance row instead of copying its value.
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
