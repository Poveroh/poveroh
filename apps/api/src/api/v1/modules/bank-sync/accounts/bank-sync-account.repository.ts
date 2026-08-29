import prisma, { Prisma } from '@poveroh/prisma'
import { bankSyncAccountSelect } from '@/types/select'
import type { ActiveBankSyncAccountMapping, BankSyncAccountMapping } from '@poveroh/types'

export type BankSyncAccountRecord = Prisma.BankSyncAccountGetPayload<{ select: typeof bankSyncAccountSelect }>

export class BankSyncAccountRepository {
    /**
     * Lists the non-deleted account mappings for a connection.
     * @param connectionId The connection whose account mappings are being retrieved.
     * @returns A promise that resolves to the connection's account mappings.
     */
    async listByConnection(connectionId: string): Promise<BankSyncAccountRecord[]> {
        return prisma.bankSyncAccount.findMany({
            where: { connectionId, deletedAt: null },
            select: bankSyncAccountSelect
        })
    }

    /**
     * Lists the live mappings that currently hold any of the given FinancialAccounts, in any
     * connection, so the caller can tell an already-claimed account from a releasable leftover.
     * @param financialAccountIds The FinancialAccounts being claimed.
     * @returns A promise that resolves to the live mappings holding those accounts.
     */
    async findLiveByFinancialAccountIds(financialAccountIds: string[]): Promise<ActiveBankSyncAccountMapping[]> {
        const rows = await prisma.bankSyncAccount.findMany({
            where: { financialAccountId: { in: financialAccountIds }, deletedAt: null },
            select: {
                id: true,
                connectionId: true,
                externalAccountId: true,
                financialAccountId: true,
                connection: { select: { deletedAt: true } }
            }
        })

        return rows.map(row => ({
            id: row.id,
            connectionId: row.connectionId,
            externalAccountId: row.externalAccountId,
            financialAccountId: row.financialAccountId,
            connectionRevoked: row.connection.deletedAt !== null
        }))
    }

    /**
     * Applies a connection's mappings in one transaction: the releasable mappings are soft-deleted
     * first so they stop occupying their FinancialAccount, then each requested mapping is created
     * or repointed. Doing both in the same transaction is what makes swapping two accounts within
     * a connection, or reclaiming a revoked connection's account, possible at all - the live
     * uniqueness on `financialAccountId` would otherwise reject the write mid-way.
     * @param connectionId The connection whose accounts are being mapped.
     * @param mappings The external-account-to-FinancialAccount mappings to persist.
     * @param releaseIds The mappings to soft-delete before writing, freeing their FinancialAccount.
     * @returns A promise that resolves to the persisted mappings.
     */
    async applyMappings(
        connectionId: string,
        mappings: BankSyncAccountMapping[],
        releaseIds: string[]
    ): Promise<BankSyncAccountRecord[]> {
        return prisma.$transaction(async tx => {
            if (releaseIds.length > 0) {
                await tx.bankSyncAccount.updateMany({
                    where: { id: { in: releaseIds } },
                    data: { deletedAt: new Date() }
                })
            }

            const persisted: BankSyncAccountRecord[] = []

            for (const mapping of mappings) {
                const record = await tx.bankSyncAccount.upsert({
                    where: {
                        connectionId_externalAccountId: {
                            connectionId,
                            externalAccountId: mapping.externalAccountId
                        }
                    },
                    // Clearing deletedAt revives a mapping that was released above, so repointing
                    // and swapping reuse the row that already identifies this external account.
                    update: { financialAccountId: mapping.financialAccountId, deletedAt: null },
                    create: { connectionId, ...mapping },
                    select: bankSyncAccountSelect
                })

                persisted.push(record)
            }

            return persisted
        })
    }

    /**
     * Soft-deletes every live mapping of a connection, called when the connection is revoked so
     * its FinancialAccounts become linkable again while the rows stay as history for the
     * transactions that reference them.
     * @param connectionId The connection whose mappings are being released.
     */
    async releaseByConnection(connectionId: string): Promise<void> {
        await prisma.bankSyncAccount.updateMany({
            where: { connectionId, deletedAt: null },
            data: { deletedAt: new Date() }
        })
    }

    /**
     * Persists the sync cursor and last-synced timestamp for one account, called after each
     * successful account sync so progress is not lost if a later account in the same run fails.
     * @param id The account mapping being updated.
     * @param cursor The opaque cursor to persist for the next incremental sync.
     */
    async updateCursor(id: string, cursor: string | null): Promise<void> {
        await prisma.bankSyncAccount.update({
            where: { id },
            data: { syncCursor: cursor, lastSyncedAt: new Date() }
        })
    }
}
