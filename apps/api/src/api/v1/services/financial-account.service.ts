import prisma from '@poveroh/prisma'
import { buildWhere } from '../../../helpers/filter.helper'
import {
    CreateFinancialAccountRequest,
    FinancialAccountData,
    FinancialAccountFilters,
    UpdateFinancialAccountRequest
} from '@poveroh/types'
import { BaseService } from './base.service'

/**
 * Service class for managing financial accounts, including creating, updating, deleting, and retrieving financial accounts for the authenticated user
 * All methods automatically retrieve the user ID from the request context.
 */

export class FinancialAccountService extends BaseService {
    /**
     * Initializes the FinancialAccountService with the user ID from the request context
     * @param userId The ID of the authenticated user
     */
    constructor(userId: string) {
        super(userId, 'financial-account')
    }

    /**
     * Creates a new financial account for the authenticated user with the provided data and optional logo file
     * @param payload The data for the new financial account
     * @param file An optional logo file for the financial account
     * @returns The created financial account data response
     */
    async createFinancialAccount(
        payload: CreateFinancialAccountRequest,
        file?: Express.Multer.File
    ): Promise<FinancialAccountData> {
        const userId = this.getUserId()

        const generatedId = crypto.randomUUID() as string

        if (file) {
            payload.logoIcon = await this.saveFile(generatedId, file)
        }

        return (await prisma.financialAccount.create({
            data: { ...payload, userId, id: generatedId }
        })) as unknown as FinancialAccountData
    }

    /**
     * Updates an existing financial account with the specified ID for the authenticated user
     * @param id The ID of the financial account to update
     * @param payload The updated data for the financial account
     * @param file An optional new logo file for the financial account
     * @returns The updated financial account data response
     */
    async updateFinancialAccount(
        id: string,
        payload: UpdateFinancialAccountRequest,
        file?: Express.Multer.File
    ): Promise<void> {
        const userId = this.getUserId()

        if (file) {
            payload.logoIcon = await this.saveFile(id, file)
        }

        await prisma.financialAccount.update({
            where: { id, userId },
            data: payload
        })
    }

    /**
     * Deletes a financial account with the specified ID for the authenticated user
     * @param id The ID of the financial account to delete
     */
    async deleteFinancialAccount(id: string): Promise<void> {
        const userId = this.getUserId()
        const deletedAt = new Date()

        await prisma.financialAccount.update({
            where: { id, userId, deletedAt: null },
            data: { deletedAt }
        })
    }

    /**
     * Deletes all financial accounts for the authenticated user
     */
    async deleteAllFinancialAccounts(): Promise<void> {
        const userId = this.getUserId()
        const deletedAt = new Date()

        await prisma.financialAccount.updateMany({
            where: { userId, deletedAt: null },
            data: { deletedAt }
        })
    }

    /**
     * Retrieves a financial account by its ID for the authenticated user
     * @param id The ID of the financial account to retrieve
     * @returns The financial account data response if found, or null if not found
     */
    async getFinancialAccountById(id: string): Promise<FinancialAccountData | null> {
        const userId = this.getUserId()

        return (await prisma.financialAccount.findMany({
            where: { id, userId, deletedAt: null },
            omit: { userId: true, deletedAt: true }
        })) as unknown as FinancialAccountData | null
    }

    /**
     * Retrieves financial accounts for the authenticated user based on the provided filters, pagination, and sorting options
     * @param filters The filters to apply to the financial accounts query
     * @param skip The number of financial accounts to skip for pagination
     * @param take The number of financial accounts to take for pagination
     * @returns An object containing the financial account data and the total count
     */
    async getFinancialAccounts(
        filters: FinancialAccountFilters,
        skip: number,
        take: number
    ): Promise<FinancialAccountData[]> {
        const userId = this.getUserId()

        const whereCondition = buildWhere({ ...filters, deletedAt: null, userId }, ['title'])

        return (await prisma.financialAccount.findMany({
            where: whereCondition,
            omit: { userId: true, deletedAt: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })) as unknown as FinancialAccountData[]
    }
}
