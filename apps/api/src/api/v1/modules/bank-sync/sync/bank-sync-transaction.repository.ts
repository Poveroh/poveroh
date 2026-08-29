import prisma from '@poveroh/prisma'
import type {
    CurrencyEnum,
    SyncedTransactionRemovalRow,
    SyncedTransactionRow,
    TransactionActionEnum
} from '@poveroh/types'
import { syncedTransactionRemovalSelect, syncedTransactionSelect } from '@/types/select'

export class BankSyncTransactionRepository {
    /**
     * Loads, in a single lookup, the transactions we already hold for the given external ids on one
     * bank-sync account, so a run can tell an update from a transaction that is new to us without
     * querying per row.
     * @param bankSyncAccountId The bank-sync account the transactions belong to.
     * @param externalIds The provider's external transaction ids being reconciled.
     * @returns A promise that resolves to the rows we already hold, keyed in the caller by external id.
     */
    async findSyncedByExternalIds(bankSyncAccountId: string, externalIds: string[]): Promise<SyncedTransactionRow[]> {
        return prisma.amount.findMany({
            where: { bankSyncAccountId, externalTransactionId: { in: externalIds } },
            select: syncedTransactionSelect
        }) as unknown as SyncedTransactionRow[]
    }

    /**
     * Applies a provider-side change to a transaction we already hold, updating the transaction and
     * its amount atomically so the pair never diverges.
     * @param transactionId The transaction to update.
     * @param amountId The amount row to update.
     * @param data The new date, title, amount, currency and action reported by the provider.
     */
    async applyProviderUpdate(
        transactionId: string,
        amountId: string,
        data: { date: Date; title: string; amount: number; currency: CurrencyEnum; action: TransactionActionEnum }
    ): Promise<void> {
        await prisma.$transaction([
            prisma.transaction.update({
                where: { id: transactionId },
                data: { date: data.date, title: data.title }
            }),
            prisma.amount.update({
                where: { id: amountId },
                data: { amount: data.amount, currency: data.currency, action: data.action }
            })
        ])
    }

    /**
     * Loads what the caller needs to decide whether removing the given external transactions
     * requires a balance rebuild: their transaction ids, their FinancialAccount and their status.
     * @param bankSyncAccountId The bank-sync account the removed transactions belong to.
     * @param externalIds The provider's external transaction ids reported as removed.
     * @returns A promise that resolves to the rows matching those external ids.
     */
    async findRemovalTargets(bankSyncAccountId: string, externalIds: string[]): Promise<SyncedTransactionRemovalRow[]> {
        return prisma.amount.findMany({
            where: { bankSyncAccountId, externalTransactionId: { in: externalIds } },
            select: syncedTransactionRemovalSelect
        }) as unknown as SyncedTransactionRemovalRow[]
    }

    /**
     * Soft-deletes the given transactions together with their amounts, preserving history for a
     * transaction the provider has withdrawn.
     * @param transactionIds The transactions to soft-delete.
     */
    async softDeleteByTransactionIds(transactionIds: string[]): Promise<void> {
        const now = new Date()

        await prisma.$transaction([
            prisma.transaction.updateMany({ where: { id: { in: transactionIds } }, data: { deletedAt: now } }),
            prisma.amount.updateMany({ where: { transactionId: { in: transactionIds } }, data: { deletedAt: now } })
        ])
    }
}
