import prisma, { Prisma } from '@poveroh/prisma'
import type { PrismaTransactionClient } from '@poveroh/prisma'
import type {
    Amount,
    ImportCandidateTransaction,
    ImportData,
    ImportFilters,
    ImportProcessingTarget,
    ImportStatusEnum,
    ImportTransactionDataResponse,
    ImportTransactionDraft,
    TransactionStatusEnum,
    UpdateImportRequest
} from '@poveroh/types'
import { buildWhere } from '@/helpers/filter.helper'
import { toBoolean } from '@poveroh/utils'

type Db = PrismaTransactionClient | typeof prisma

const importInclude = {
    files: true,
    transactions: { include: { amounts: true, media: true } }
} satisfies Prisma.ImportInclude

const IMPORT_TRANSACTION_STATUSES: TransactionStatusEnum[] = ['IMPORT_PENDING', 'IMPORT_APPROVED', 'IMPORT_REJECTED']
const PENDING_OR_REJECTED_STATUSES: TransactionStatusEnum[] = ['IMPORT_PENDING', 'IMPORT_REJECTED']

export class ImportRepository {
    /**
     * Creates an import row owned by the specified user using the provided initial state.
     * @param tx The Prisma transaction client used to run the create within the active transaction.
     * @param data The create input for the import row, including its identifier, owning user and initial status.
     * @returns A promise that resolves when the import row has been created.
     */
    async create(tx: Db, data: Prisma.ImportCreateManyInput): Promise<void> {
        await tx.import.create({ data })
    }

    /**
     * Bulk inserts file records associated with an import.
     * @param tx The Prisma transaction client used to run the insert within the active transaction.
     * @param data The list of file rows to be created for the import.
     * @returns A promise that resolves when the file rows have been created.
     */
    async createImportFiles(tx: Db, data: Prisma.ImportFileCreateManyInput[]): Promise<void> {
        if (data.length === 0) return
        await tx.importFile.createMany({ data })
    }

    /**
     * Bulk inserts transaction rows associated with an import.
     * @param tx The Prisma transaction client used to run the insert within the active transaction.
     * @param data The list of transaction rows to be created.
     * @returns A promise that resolves when the transaction rows have been created.
     */
    async createTransactions(tx: Db, data: Prisma.TransactionCreateManyInput[]): Promise<void> {
        if (data.length === 0) return
        await tx.transaction.createMany({ data })
    }

    /**
     * Bulk inserts amount rows associated with import transactions.
     * @param tx The Prisma transaction client used to run the insert within the active transaction.
     * @param data The list of amount rows to be created.
     * @returns A promise that resolves when the amount rows have been created.
     */
    async createAmounts(tx: Db, data: Prisma.AmountCreateManyInput[]): Promise<void> {
        if (data.length === 0) return
        await tx.amount.createMany({ data })
    }

    /**
     * Persists enriched transactions and their amounts, translating the module's draft type into
     * Prisma inputs here so no Prisma type has to travel between the services above.
     * @param tx The Prisma client used to run the inserts.
     * @param drafts The enriched transactions to persist.
     * @returns A promise that resolves when the rows have been created.
     */
    async createTransactionDrafts(tx: Db, drafts: ImportTransactionDraft[]): Promise<void> {
        if (drafts.length === 0) return

        await tx.transaction.createMany({
            data: drafts.map(draft => ({
                id: draft.id,
                userId: draft.userId,
                importId: draft.importId,
                date: new Date(draft.date),
                title: draft.title,
                note: draft.note,
                icon: draft.icon,
                categoryId: draft.categoryId,
                subcategoryId: draft.subcategoryId,
                subscriptionId: draft.subscriptionId,
                bankConnectionId: draft.bankConnectionId,
                action: draft.action,
                status: 'IMPORT_PENDING',
                ignore: false
            }))
        })

        await tx.amount.createMany({
            data: drafts.map(draft => ({
                transactionId: draft.id,
                amount: draft.amount,
                currency: draft.currency,
                action: draft.action,
                financialAccountId: draft.financialAccountId,
                bankSyncAccountId: draft.bankSyncAccountId,
                externalTransactionId: draft.externalTransactionId
            }))
        })
    }

    /**
     * Stages the transactions a source delivered, so they survive until the import is processed.
     * Rows already staged for the same external transaction are skipped, which makes re-delivery of
     * an overlapping batch harmless.
     * @param importId The import the transactions belong to.
     * @param candidates The transactions to stage.
     * @returns A promise that resolves when the rows have been staged.
     */
    async createStagedTransactions(importId: string, candidates: ImportCandidateTransaction[]): Promise<void> {
        if (candidates.length === 0) return

        await prisma.importStagedTransaction.createMany({
            data: candidates.map(candidate => ({
                ...candidate,
                importId,
                date: new Date(candidate.date)
            })),
            skipDuplicates: true
        })
    }

    /**
     * Reads the transactions staged for an import, oldest first.
     * @param importId The import whose staged rows must be read.
     * @returns A promise that resolves to the staged transactions.
     */
    async findStagedTransactions(importId: string): Promise<ImportCandidateTransaction[]> {
        const staged = await prisma.importStagedTransaction.findMany({
            where: { importId },
            orderBy: { date: 'asc' }
        })

        return staged.map(row => ({
            date: row.date.toISOString(),
            title: row.title,
            amount: Number(row.amount),
            currency: row.currency,
            action: row.action,
            externalTransactionId: row.externalTransactionId,
            bankSyncAccountId: row.bankSyncAccountId
        }))
    }

    /**
     * Drops the staged rows of an import once they have been turned into real transactions.
     * @param tx The Prisma client used to run the delete, so it commits with the transactions it produced.
     * @param importId The import whose staged rows must be dropped.
     * @returns A promise that resolves when the rows have been deleted.
     */
    async deleteStagedTransactions(tx: Db, importId: string): Promise<void> {
        await tx.importStagedTransaction.deleteMany({ where: { importId } })
    }

    /**
     * Records that an import could not be processed, keeping the reason on the row so the UI can
     * show it rather than leaving the user with an import that silently never fills.
     * @param userId The ID of the user who owns the import.
     * @param importId The import that failed.
     * @param reason The error message to surface.
     * @returns A promise that resolves when the failure has been recorded.
     */
    async markFailed(userId: string, importId: string, reason: string): Promise<void> {
        await prisma.import.updateMany({
            where: { id: importId, userId },
            data: { status: 'FAILED', failureReason: reason }
        })
    }

    /**
     * Reads the import-wide values needed to process an import.
     * @param userId The ID of the user who owns the import.
     * @param importId The import being processed.
     * @returns A promise that resolves to the processing target, or null when the import is not found.
     */
    async findProcessingTarget(userId: string, importId: string): Promise<ImportProcessingTarget | null> {
        return prisma.import.findFirst({
            where: { id: importId, userId, deletedAt: null },
            select: { source: true, financialAccountId: true, bankConnectionId: true, autoApprove: true }
        })
    }

    /**
     * Reads the files attached to an import, used to re-parse a CSV import outside the request that uploaded it.
     * @param importId The import whose files must be read.
     * @returns A promise that resolves to the stored path and original name of each file.
     */
    async findImportFiles(importId: string): Promise<Array<{ path: string; filename: string }>> {
        return prisma.importFile.findMany({
            where: { importId, deletedAt: null },
            select: { path: true, filename: true }
        })
    }

    /**
     * Updates an import owned by the specified user using the provided payload.
     * @param userId The ID of the user who owns the import being updated.
     * @param id The unique identifier of the import being updated.
     * @param payload The payload containing the fields to be updated on the import.
     * @returns A promise that resolves to the updated import row.
     */
    async update(userId: string, id: string, payload: UpdateImportRequest): Promise<ImportData> {
        return (await prisma.import.update({
            where: { id, userId },
            data: payload
        })) as unknown as ImportData
    }

    /**
     * Updates the status of an import row owned by the specified user, using the provided Prisma client to run inside an active transaction.
     * @param tx The Prisma client used to run the update.
     * @param userId The ID of the user who owns the import being updated.
     * @param id The unique identifier of the import being updated.
     * @param status The status that the import row should be transitioned to.
     * @returns A promise that resolves to the updated import row.
     */
    async updateStatus(tx: Db, userId: string, id: string, status: ImportStatusEnum): Promise<ImportData> {
        return (await tx.import.update({
            where: { id, userId },
            // Any transition away from FAILED clears the reason, so a successful retry does not
            // leave the previous attempt's error on the row.
            data: { status, failureReason: status === 'FAILED' ? undefined : null }
        })) as unknown as ImportData
    }

    /**
     * Updates the status of import transactions matching the provided source status, transitioning them to the target status.
     * @param tx The Prisma client used to run the update.
     * @param userId The ID of the user who owns the import and transactions being updated.
     * @param importId The unique identifier of the import whose transactions are being updated.
     * @param fromStatus The source status of the transactions that should be updated.
     * @param toStatus The target status that the matching transactions should be transitioned to.
     * @returns A promise that resolves when the transactions have been updated.
     */
    async updateTransactionsStatus(
        tx: Db,
        userId: string,
        importId: string,
        fromStatus: TransactionStatusEnum,
        toStatus: TransactionStatusEnum
    ): Promise<void> {
        await tx.transaction.updateMany({
            where: { status: fromStatus, importId, userId },
            data: { status: toStatus }
        })
    }

    /**
     * Updates the status of a single import transaction owned by the specified user inside the supplied import.
     * @param tx The Prisma client used to run the update.
     * @param userId The ID of the user who owns the transaction being updated.
     * @param importId The unique identifier of the import the transaction belongs to.
     * @param transactionId The unique identifier of the transaction being updated.
     * @param status The status that the transaction should be transitioned to.
     * @returns A promise that resolves when the transaction has been updated.
     */
    async updateTransactionStatus(
        tx: Db,
        userId: string,
        importId: string,
        transactionId: string,
        status: TransactionStatusEnum
    ): Promise<void> {
        await tx.transaction.update({
            where: { id: transactionId, importId, userId },
            data: { status }
        })
    }

    /**
     * Finds the import transactions in the provided status that belong to the import and user, including their date and related amounts.
     * @param tx The Prisma client used to run the query.
     * @param userId The ID of the user who owns the transactions being retrieved.
     * @param importId The unique identifier of the import the transactions belong to.
     * @param status The status used to filter the import transactions.
     * @returns A promise that resolves to the list of transactions enriched with their date and amounts.
     */
    async findTransactionsByStatusWithAmounts(
        tx: Db,
        userId: string,
        importId: string,
        status: TransactionStatusEnum
    ): Promise<Array<{ date: Date; amounts: Amount[] }>> {
        return (await tx.transaction.findMany({
            where: { status, importId, userId },
            include: { amounts: true }
        })) as unknown as Array<{ date: Date; amounts: Amount[] }>
    }

    /**
     * Deletes the amount rows associated with import transactions that are either pending or rejected.
     * @param tx The Prisma client used to run the delete.
     * @param userId The ID of the user who owns the transactions being deleted.
     * @param importId The unique identifier of the import whose transactions amounts must be deleted.
     * @returns A promise that resolves when the amount rows have been deleted.
     */
    async deletePendingOrRejectedAmounts(tx: Db, userId: string, importId: string): Promise<void> {
        await tx.amount.deleteMany({
            where: {
                transaction: {
                    importId,
                    userId,
                    status: { in: PENDING_OR_REJECTED_STATUSES }
                }
            }
        })
    }

    /**
     * Deletes the import transactions that are either pending or rejected for the specified import and user.
     * @param tx The Prisma client used to run the delete.
     * @param userId The ID of the user who owns the transactions being deleted.
     * @param importId The unique identifier of the import whose pending or rejected transactions must be deleted.
     * @returns A promise that resolves when the transactions have been deleted.
     */
    async deletePendingOrRejectedTransactions(tx: Db, userId: string, importId: string): Promise<void> {
        await tx.transaction.deleteMany({
            where: {
                importId,
                userId,
                status: { in: PENDING_OR_REJECTED_STATUSES }
            }
        })
    }

    /**
     * Deletes the amount rows associated with the supplied transaction ids.
     * @param tx The Prisma client used to run the delete.
     * @param transactionIds The list of transaction ids whose amount rows must be deleted.
     * @returns A promise that resolves when the amount rows have been deleted.
     */
    async deleteAmountsByTransactionIds(tx: Db, transactionIds: string[]): Promise<void> {
        if (transactionIds.length === 0) return
        await tx.amount.deleteMany({
            where: { transactionId: { in: transactionIds } }
        })
    }

    /**
     * Deletes every transaction belonging to the specified import owned by the user.
     * @param tx The Prisma client used to run the delete.
     * @param userId The ID of the user who owns the transactions being deleted.
     * @param importId The unique identifier of the import whose transactions must be deleted.
     * @returns A promise that resolves when the transactions have been deleted.
     */
    async deleteTransactionsByImport(tx: Db, userId: string, importId: string): Promise<void> {
        await tx.transaction.deleteMany({
            where: { importId, userId }
        })
    }

    /**
     * Deletes the import files associated with the specified import.
     * @param tx The Prisma client used to run the delete.
     * @param importId The unique identifier of the import whose files must be deleted.
     * @returns A promise that resolves when the files have been deleted.
     */
    async deleteImportFiles(tx: Db, importId: string): Promise<void> {
        await tx.importFile.deleteMany({
            where: { importId }
        })
    }

    /**
     * Deletes the import row identified by the provided id and owning user.
     * @param tx The Prisma client used to run the delete.
     * @param userId The ID of the user who owns the import being deleted.
     * @param id The unique identifier of the import being deleted.
     * @returns A promise that resolves when the import has been deleted.
     */
    async deleteImport(tx: Db, userId: string, id: string): Promise<void> {
        await tx.import.delete({
            where: { id, userId }
        })
    }

    /**
     * Retrieves the ids of every import-related transaction (pending, approved, rejected) for the supplied import.
     * @param userId The ID of the user who owns the transactions being retrieved.
     * @param importId The unique identifier of the import whose transaction ids must be retrieved.
     * @returns A promise that resolves to the list of transaction ids belonging to the import.
     */
    async findImportTransactionIds(userId: string, importId: string): Promise<string[]> {
        const transactions = await prisma.transaction.findMany({
            where: {
                importId,
                userId,
                status: { in: IMPORT_TRANSACTION_STATUSES }
            },
            select: { id: true }
        })
        return transactions.map(t => t.id)
    }

    /**
     * Retrieves every import id owned by the user, used to chain bulk operations across imports.
     * @param userId The ID of the user whose imports must be retrieved.
     * @returns A promise that resolves to the list of import ids owned by the user.
     */
    async findAllImportIds(userId: string): Promise<string[]> {
        const imports = await prisma.import.findMany({
            where: { userId },
            select: { id: true }
        })
        return imports.map(i => i.id)
    }

    /**
     * Finds an import by its identifier for the specified user, including its files and transactions with related amounts and media.
     * @param userId The ID of the user who owns the import being retrieved.
     * @param id The unique identifier of the import being retrieved.
     * @returns A promise that resolves to the import data if found, or null when no record matches.
     */
    async findById(userId: string, id: string): Promise<ImportData | null> {
        return (await prisma.import.findFirst({
            where: { id, userId },
            include: importInclude
        })) as unknown as ImportData | null
    }

    /**
     * Finds an import by id and owning user and asserts the import exists; intended to be used after a verified write inside an active transaction.
     * @param userId The ID of the user who owns the import being retrieved.
     * @param id The unique identifier of the import being retrieved.
     * @returns A promise that resolves to the import data including its files and transactions.
     */
    async findByIdOrThrow(userId: string, id: string): Promise<ImportData> {
        return (await prisma.import.findUniqueOrThrow({
            where: { id, userId },
            include: importInclude
        })) as unknown as ImportData
    }

    /**
     * Finds imports for the specified user using the supplied filters and pagination options, optionally hydrating transactions with amounts and media.
     * @param userId The ID of the user who owns the imports being retrieved.
     * @param filters The filters to apply when retrieving imports.
     * @param skip The number of records to skip for pagination purposes.
     * @param take The number of records to take for pagination purposes.
     * @returns A promise that resolves to the list of imports matching the filters and pagination options.
     */
    async findMany(userId: string, filters: ImportFilters, skip: number, take: number): Promise<ImportData[]> {
        const { includeTransactions, ...filterRest } = filters
        const shouldIncludeTransactions = toBoolean(String(includeTransactions))

        const where = buildWhere({ ...filterRest, deletedAt: null, userId }, ['title'])

        return prisma.import.findMany({
            where,
            include: {
                files: true,
                transactions: shouldIncludeTransactions ? { include: { amounts: true, media: true } } : true
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take
        }) as unknown as ImportData[]
    }

    /**
     * Retrieves every pending, approved or rejected transaction belonging to the supplied import, projected with the shape expected by the public API.
     * @param userId The ID of the user who owns the transactions being retrieved.
     * @param importId The unique identifier of the import whose transactions must be retrieved.
     * @returns A promise that resolves to the list of import transactions enriched with amounts and media.
     */
    async findImportTransactions(userId: string, importId: string): Promise<ImportTransactionDataResponse[]> {
        return (await prisma.transaction.findMany({
            where: {
                importId,
                userId,
                status: { in: IMPORT_TRANSACTION_STATUSES }
            },
            omit: { userId: true, importId: true, deletedAt: true },
            include: { amounts: true, media: true },
            orderBy: { createdAt: 'desc' }
        })) as unknown as ImportTransactionDataResponse[]
    }

    /**
     * Finds an import still awaiting review that a recurring source is already filling for the same
     * account and connection, so repeated runs collect into one batch instead of leaving an import
     * behind on every run.
     * @param userId The ID of the user who owns the import being searched for.
     * @param financialAccountId The financial account the import must belong to.
     * @param bankConnectionId The connection the import must have been opened for.
     * @returns A promise that resolves to the open import id, or null when none exists.
     */
    async findOpenSourceImport(
        userId: string,
        financialAccountId: string,
        bankConnectionId: string
    ): Promise<{ id: string } | null> {
        return prisma.import.findFirst({
            where: {
                userId,
                financialAccountId,
                bankConnectionId,
                status: 'PENDING_REVIEW',
                deletedAt: null
            },
            select: { id: true }
        })
    }

    /**
     * Reads the provider a bank connection belongs to, stored on the import as its source reference
     * so the origin of a synced batch survives on the import row itself.
     * @param userId The ID of the user who owns the connection.
     * @param bankConnectionId The unique identifier of the connection whose provider must be read.
     * @returns A promise that resolves to the provider id, or null when the connection is not found.
     */
    async findConnectionProviderId(userId: string, bankConnectionId: string): Promise<string | null> {
        const connection = await prisma.bankConnection.findFirst({
            where: { id: bankConnectionId, userId },
            select: { providerId: true }
        })
        return connection?.providerId ?? null
    }

    /**
     * Returns whether an import exists for the supplied id and owning user.
     * @param userId The ID of the user who owns the import being checked.
     * @param id The unique identifier of the import being checked.
     * @returns A promise that resolves to true when the import exists, or false otherwise.
     */
    async exists(userId: string, id: string): Promise<boolean> {
        const count = await prisma.import.count({
            where: { id, userId, deletedAt: null }
        })
        return count > 0
    }
}
