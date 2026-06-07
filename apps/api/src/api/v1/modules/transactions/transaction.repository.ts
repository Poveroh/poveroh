import prisma, { Prisma } from '@poveroh/prisma'
import type { TransactionData, TransactionFilters, TransactionStatusEnum } from '@poveroh/types'
import { buildWhere } from '@/helpers/filter.helper'

type Db = Prisma.TransactionClient | typeof prisma

const transactionInclude = {
    amounts: true,
    media: true
} satisfies Prisma.TransactionInclude

const transactionOmit = {
    userId: true,
    deletedAt: true
} satisfies Prisma.TransactionOmit

const transferInclude = {
    fromTransaction: { include: transactionInclude },
    toTransaction: { include: transactionInclude }
} satisfies Prisma.TransferInclude

type TransferWithSides = Prisma.TransferGetPayload<{ include: typeof transferInclude }>

export class TransactionRepository {
    /**
     * Creates a single transaction row owned by the specified user inside the supplied Prisma client, used inside service-orchestrated transactions.
     * @param tx The Prisma client used to run the create.
     * @param data The create input for the transaction row.
     * @returns A promise that resolves to the created transaction row.
     */
    async create(tx: Db, data: Prisma.TransactionCreateManyInput) {
        return tx.transaction.create({ data })
    }

    /**
     * Bulk creates transaction rows and returns the inserted records, used for transfer flows that need both sides.
     * @param tx The Prisma client used to run the create.
     * @param data The list of transaction rows to be created.
     * @returns A promise that resolves to the list of created transaction rows.
     */
    async createManyAndReturn(tx: Db, data: Prisma.TransactionCreateManyInput[]) {
        return tx.transaction.createManyAndReturn({ data })
    }

    /**
     * Bulk inserts amount rows associated with transactions.
     * @param tx The Prisma client used to run the insert.
     * @param data The list of amount rows to be created.
     * @returns A promise that resolves when the amount rows have been created.
     */
    async createAmounts(tx: Db, data: Prisma.AmountCreateManyInput[]): Promise<void> {
        if (data.length === 0) return
        await tx.amount.createMany({ data })
    }

    /**
     * Updates a transaction identified by id and owning user using the supplied payload.
     * @param tx The Prisma client used to run the update.
     * @param userId The ID of the user who owns the transaction.
     * @param id The unique identifier of the transaction being updated.
     * @param data The update payload to be applied.
     * @returns A promise that resolves when the transaction has been updated.
     */
    async update(tx: Db, userId: string, id: string, data: Prisma.TransactionUpdateInput): Promise<void> {
        await tx.transaction.update({
            where: { id, userId },
            data
        })
    }

    /**
     * Updates the transfer reference of the supplied transactions so both sides of a transfer share the same transfer id.
     * @param tx The Prisma client used to run the update.
     * @param transactionIds The ids of the transactions that must be linked to the transfer.
     * @param transferId The transfer id to associate with the transactions.
     * @returns A promise that resolves when the transactions have been updated.
     */
    async linkTransfer(tx: Db, transactionIds: string[], transferId: string): Promise<void> {
        await tx.transaction.updateMany({
            where: { id: { in: transactionIds } },
            data: { transferId }
        })
    }

    /**
     * Creates a transfer row linking the supplied source and destination transactions, owned by the specified user.
     * @param tx The Prisma client used to run the create.
     * @param data The create input for the transfer row, including the source and destination transaction ids.
     * @returns A promise that resolves to the created transfer row.
     */
    async createTransfer(tx: Db, data: Prisma.TransferUncheckedCreateInput) {
        return tx.transfer.create({ data })
    }

    /**
     * Deletes the amount rows associated with the supplied transaction id.
     * @param tx The Prisma client used to run the delete.
     * @param transactionId The unique identifier of the transaction whose amount rows must be deleted.
     * @returns A promise that resolves when the amount rows have been deleted.
     */
    async deleteAmountsByTransactionId(tx: Db, transactionId: string): Promise<void> {
        await tx.amount.deleteMany({ where: { transactionId } })
    }

    /**
     * Deletes a transaction identified by id and owning user.
     * @param userId The ID of the user who owns the transaction.
     * @param id The unique identifier of the transaction being deleted.
     * @returns A promise that resolves when the transaction has been deleted.
     */
    async delete(userId: string, id: string): Promise<void> {
        await prisma.transaction.delete({
            where: { id, userId }
        })
    }

    /**
     * Deletes every transaction owned by the specified user.
     * @param userId The ID of the user whose transactions must be deleted.
     * @returns A promise that resolves when the transactions have been deleted.
     */
    async deleteAll(userId: string): Promise<void> {
        await prisma.transaction.deleteMany({
            where: { userId }
        })
    }

    /**
     * Finds a transaction by id and owning user, including its amounts and media.
     * @param userId The ID of the user who owns the transaction.
     * @param id The unique identifier of the transaction being retrieved.
     * @returns A promise that resolves to the transaction with amounts and media, or null when not found.
     */
    async findById(userId: string, id: string): Promise<TransactionData | null> {
        return (await prisma.transaction.findFirst({
            where: { id, userId },
            omit: transactionOmit,
            include: transactionInclude
        })) as unknown as TransactionData | null
    }

    /**
     * Finds a transaction by id and owning user including its amounts, used internally when both sides of a transfer must be fetched within an active transaction.
     * @param tx The Prisma client used to run the query.
     * @param userId The ID of the user who owns the transaction.
     * @param id The unique identifier of the transaction being retrieved.
     * @returns A promise that resolves to the transaction enriched with amounts, or null when not found.
     */
    async findByIdWithAmounts(tx: Db, userId: string, id: string) {
        return tx.transaction.findFirst({
            where: { id, userId },
            include: { amounts: true }
        })
    }

    /**
     * Finds a transfer by id including both sides of the transfer enriched with amounts and media, or null when the transfer does not exist.
     * @param transferId The unique identifier of the transfer being retrieved.
     * @returns A promise that resolves to the transfer with both sides hydrated, or null when not found.
     */
    async findTransferById(transferId: string): Promise<TransferWithSides | null> {
        return prisma.transfer.findUnique({
            where: { id: transferId },
            include: transferInclude
        })
    }

    /**
     * Finds transactions matching the supplied where clause with the requested ordering and pagination, enriched with amounts and media.
     * @param where The Prisma where clause used to filter the transactions.
     * @param orderBy The ordering to apply to the transactions.
     * @param skip The number of records to skip for pagination purposes.
     * @param take The number of records to take for pagination purposes, omitted when undefined.
     * @returns A promise that resolves to the list of transactions matching the criteria.
     */
    async findMany(
        where: Prisma.TransactionWhereInput,
        orderBy: Prisma.TransactionOrderByWithRelationInput[],
        skip: number,
        take?: number
    ) {
        return prisma.transaction.findMany({
            where,
            include: transactionInclude,
            omit: transactionOmit,
            orderBy,
            skip,
            ...(take === undefined ? {} : { take })
        })
    }

    /**
     * Counts the transactions matching the supplied where clause.
     * @param where The Prisma where clause used to filter the transactions to count.
     * @returns A promise that resolves to the total number of matching transactions.
     */
    async count(where: Prisma.TransactionWhereInput): Promise<number> {
        return prisma.transaction.count({ where })
    }

    /**
     * Builds a where clause combining the supplied filter payload with the standard ownership and approved-status constraints used when listing transactions.
     * @param payload The filter payload supplied by the caller, optionally including a financial account filter.
     * @returns The composed Prisma where clause.
     */
    buildListWhere(
        payload: TransactionFilters & { userId: string; status: TransactionStatusEnum }
    ): Prisma.TransactionWhereInput {
        const { financialAccountId, ...rest } = payload

        return buildWhere(
            {
                ...rest,
                ...(financialAccountId ? { amounts: { some: { financialAccountId } } } : {})
            },
            []
        )
    }

    /**
     * Bulk inserts the transaction media rows produced after uploading attached files.
     * @param data The list of transaction media rows to be created.
     * @returns A promise that resolves when the transaction media rows have been created.
     */
    async createTransactionMedia(data: Prisma.TransactionMediaCreateManyInput[]): Promise<void> {
        if (data.length === 0) return
        await prisma.transactionMedia.createMany({ data })
    }
}
