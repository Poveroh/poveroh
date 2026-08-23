import prisma, { Prisma } from '@poveroh/prisma'
import { bankSyncAccountSelect } from '@/types/select'
import { CreateBankSyncAccountRequest, CurrencyEnum } from '@poveroh/types'

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
     * Persists a new mapping between an external account and a FinancialAccount.
     * @param input The mapping fields to persist.
     * @returns A promise that resolves to the created mapping.
     */
    async create(payload: CreateBankSyncAccountRequest): Promise<BankSyncAccountRecord> {
        return prisma.bankSyncAccount.create({
            data: payload,
            select: bankSyncAccountSelect
        }) as unknown as BankSyncAccountRecord
    }

    /**
     * Creates the mapping for an external account, or repoints its existing mapping to a
     * different FinancialAccount, so re-submitting an already-mapped connection is a no-op.
     * @param payload The mapping fields to persist.
     * @returns A promise that resolves to the created or updated mapping.
     */
    async upsertByExternalAccount(payload: CreateBankSyncAccountRequest): Promise<BankSyncAccountRecord> {
        return prisma.bankSyncAccount.upsert({
            where: {
                connectionId_externalAccountId: {
                    connectionId: payload.connectionId,
                    externalAccountId: payload.externalAccountId
                }
            },
            update: { financialAccountId: payload.financialAccountId },
            create: payload,
            select: bankSyncAccountSelect
        }) as unknown as BankSyncAccountRecord
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
