import prisma, { Prisma } from '@poveroh/prisma'
import type {
    CreateFinancialAccountRequest,
    FinancialAccountData,
    FinancialAccountFilters,
    UpdateFinancialAccountRequest
} from '@poveroh/types'
import { buildWhere } from '@/helpers'

const financialAccountSelect = {
    id: true,
    title: true,
    balance: true,
    type: true,
    logoIcon: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.FinancialAccountSelect

export class FinancialAccountRepository {
    /**
     * Creates a new financial account in the database, associating it with the specified user and using the provided payload for the account details.
     * @param userId The ID of the user who owns the financial account.
     * @param id The unique identifier for the financial account.
     * @param payload The details of the financial account to be created.
     * @returns A promise that resolves to the created financial account data.
     */
    async create(userId: string, id: string, payload: CreateFinancialAccountRequest): Promise<FinancialAccountData> {
        return (await prisma.financialAccount.create({
            data: { ...payload, userId, id },
            select: financialAccountSelect
        })) as unknown as FinancialAccountData
    }

    /**
     * Updates an existing financial account in the database, ensuring that the account belongs to the specified user and is not soft-deleted.
     * @param userId The ID of the user who owns the financial account being updated.
     * @param id The unique identifier of the financial account that is being updated.
     * @param payload An object containing the new details for the financial account.
     * @returns A promise that resolves when the financial account has been updated.
     */
    async update(userId: string, id: string, payload: UpdateFinancialAccountRequest): Promise<void> {
        await prisma.financialAccount.update({
            where: { id, userId, deletedAt: null },
            data: payload
        })
    }

    /**
     * Soft-deletes a financial account in the database, ensuring that the account belongs to the specified user and is not already soft-deleted.
     * @param userId The ID of the user who owns the financial account being deleted.
     * @param id The unique identifier of the financial account that is being deleted.
     * @param deletedAt The timestamp indicating when the deletion occurred.
     * @returns A promise that resolves when the financial account has been soft-deleted.
     */
    async softDelete(userId: string, id: string, deletedAt: Date): Promise<void> {
        await prisma.financialAccount.update({
            where: { id, userId, deletedAt: null },
            data: { deletedAt }
        })
    }

    /**
     * Soft-deletes all financial accounts owned by the specified user, ensuring that only accounts that are not already soft-deleted are affected.
     * @param userId The ID of the user whose financial accounts are being deleted.
     * @param deletedAt The timestamp indicating when the deletion occurred.
     * @returns A promise that resolves when all financial accounts have been soft-deleted.
     */
    async softDeleteAll(userId: string, deletedAt: Date): Promise<void> {
        await prisma.financialAccount.updateMany({
            where: { userId, deletedAt: null },
            data: { deletedAt }
        })
    }

    /**
     * Finds a financial account by its user-scoped ID, ensuring that the account belongs to the specified user and is not soft-deleted.
     * @param userId The ID of the user who owns the financial account being retrieved.
     * @param id The unique identifier of the financial account that is being retrieved.
     * @returns A promise that resolves to a FinancialAccountData object representing the financial account that was found, or null if no account is found.
     */
    async findById(userId: string, id: string): Promise<FinancialAccountData | null> {
        return (await prisma.financialAccount.findFirst({
            where: { id, userId, deletedAt: null },
            select: financialAccountSelect
        })) as unknown as FinancialAccountData | null
    }

    /**
     * Finds multiple financial accounts based on the provided filters, ensuring that the accounts belong to the specified user and are not soft-deleted.
     * @param userId The ID of the user who owns the financial accounts being retrieved.
     * @param filters An object containing the filters to apply when retrieving the financial accounts.
     * @param skip The number of records to skip for pagination.
     * @param take The number of records to take for pagination.
     * @returns A promise that resolves to an array of FinancialAccountData objects representing the financial accounts that were found.
     */
    async findMany(
        userId: string,
        filters: FinancialAccountFilters,
        skip: number,
        take: number
    ): Promise<FinancialAccountData[]> {
        const where = buildWhere({ ...filters, deletedAt: null, userId }, ['title'])

        const rows = await prisma.financialAccount.findMany({
            where,
            select: financialAccountSelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })
        return rows as unknown as FinancialAccountData[]
    }
}
