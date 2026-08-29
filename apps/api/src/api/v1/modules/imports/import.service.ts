import prisma from '@poveroh/prisma'
import type {
    ApproveImportTransactionsRequest,
    CategoryData,
    ImportData,
    ImportFilters,
    ImportTransactionDataResponse,
    TransactionStatusEnum,
    UpdateImportRequest
} from '@poveroh/types'
import { BadRequestError, NotFoundError } from '@/utils'
import { AccountBalanceService } from '../financial-accounts/account-balance/account-balance.service'
import { BaseService } from '../base/base.service'
import { CategoryService } from '../categories/category.service'
import { eventBus } from '../../worker/events/event-bus'
import { ImportRepository } from './import.repository'

/**
 * Service class for managing imports, including creating, updating, deleting and retrieving imports for the authenticated user.
 * All methods automatically retrieve the user ID from the request context.
 */
export class ImportService extends BaseService {
    private readonly importRepository = new ImportRepository()
    private readonly accountBalanceService = new AccountBalanceService()

    constructor() {
        super('import')
    }

    /**
     * Completes an import by approving its transactions and removing the pending or rejected rows, then rebuilds the target account's daily balance series and snapshots from the earliest approved transaction date forward, since those transactions count toward the balance for the first time now that they are approved.
     * @param id The unique identifier of the import to complete.
     * @returns A promise that resolves to the updated import data.
     */
    async completeImport(id: string): Promise<ImportData> {
        const userId = this.context.currentUser.id
        let approvedDates: Date[] = []

        const data = await prisma.$transaction(async tx => {
            const approvedTransactions = await this.importRepository.findTransactionsByStatusWithAmounts(
                tx,
                userId,
                id,
                'IMPORT_APPROVED'
            )
            approvedDates = approvedTransactions.map(t => t.date)

            await this.importRepository.updateTransactionsStatus(tx, userId, id, 'IMPORT_APPROVED', 'APPROVED')

            await this.importRepository.deletePendingOrRejectedAmounts(tx, userId, id)
            await this.importRepository.deletePendingOrRejectedTransactions(tx, userId, id)

            return this.importRepository.updateStatus(tx, userId, id, 'COMPLETED')
        })

        if (approvedDates.length > 0) {
            const fromDate = new Date(Math.min(...approvedDates.map(date => date.getTime())))
            await this.accountBalanceService.recomputeAccountsAndSnapshots([data.financialAccountId], fromDate)
        }

        await eventBus.emit('import.updated', { userId, data })
        return data
    }

    /**
     * Rolls back a completed import, reverting its approved transactions to pending, then rebuilds the target account's daily balance series and snapshots from the earliest affected transaction date forward, since those transactions no longer count toward the balance once reverted.
     * @param id The unique identifier of the import to roll back.
     * @returns A promise that resolves to the updated import data.
     */
    async rollbackImport(id: string): Promise<ImportData> {
        const userId = this.context.currentUser.id
        let approvedDates: Date[] = []
        let financialAccountId = ''

        const data = await prisma.$transaction(async tx => {
            const existing = await tx.import.findFirst({ where: { id, userId } })
            if (!existing) throw new NotFoundError('Import not found')
            if (existing.status !== 'COMPLETED') {
                throw new BadRequestError('Only completed imports can be rolled back')
            }
            financialAccountId = existing.financialAccountId

            const approvedTransactions = await this.importRepository.findTransactionsByStatusWithAmounts(
                tx,
                userId,
                id,
                'APPROVED'
            )
            approvedDates = approvedTransactions.map(t => t.date)

            await this.importRepository.updateTransactionsStatus(tx, userId, id, 'APPROVED', 'IMPORT_PENDING')

            return this.importRepository.updateStatus(tx, userId, id, 'PENDING_REVIEW')
        })

        if (approvedDates.length > 0) {
            const fromDate = new Date(Math.min(...approvedDates.map(date => date.getTime())))
            await this.accountBalanceService.recomputeAccountsAndSnapshots([financialAccountId], fromDate)
        }

        await eventBus.emit('import.updated', { userId, data })
        return data
    }

    /**
     * Approves or rejects import transactions in bulk, applying the requested target status to each transaction.
     * @param importId The unique identifier of the import whose transactions are being updated.
     * @param payload The payload containing the per-transaction status changes to apply.
     * @returns A promise that resolves to the refreshed list of import transactions after the updates.
     */
    async approveImportTransactions(
        importId: string,
        payload: ApproveImportTransactionsRequest
    ): Promise<ImportTransactionDataResponse[]> {
        const userId = this.context.currentUser.id
        const allowedStatuses: TransactionStatusEnum[] = ['IMPORT_APPROVED', 'IMPORT_REJECTED']

        await prisma.$transaction(async tx => {
            for (const item of payload.transactions) {
                if (!allowedStatuses.includes(item.status)) {
                    throw new BadRequestError(`Invalid status: ${item.status}`)
                }

                await this.importRepository.updateTransactionStatus(
                    tx,
                    userId,
                    importId,
                    item.transactionId,
                    item.status
                )
            }
        })

        const data = await this.getImportById(importId)
        if (data) await eventBus.emit('import.updated', { userId, data })

        return this.getImportTransactions(importId)
    }

    /**
     * Deletes an import and every associated transaction, amount and file row for the authenticated user. When the import was approved, its transactions had counted toward the target account's balance, so the account's daily series and snapshots are rebuilt from the earliest deleted transaction date forward to back out their effect.
     * @param id The unique identifier of the import to delete.
     * @returns A promise that resolves when the import has been deleted.
     */
    async deleteImport(id: string): Promise<void> {
        const userId = this.context.currentUser.id

        const data = await this.getImportById(id)
        const transactionIds = await this.importRepository.findImportTransactionIds(userId, id)

        // Capture the approved transactions' dates before deleting: only an approved import ever affected the
        // balance, and its rows are gone once the transaction below commits.
        const approvedTransactions =
            data?.status === 'COMPLETED'
                ? await this.importRepository.findTransactionsByStatusWithAmounts(prisma, userId, id, 'APPROVED')
                : []

        await prisma.$transaction(async tx => {
            await this.importRepository.deleteAmountsByTransactionIds(tx, transactionIds)
            await this.importRepository.deleteTransactionsByImport(tx, userId, id)
            await this.importRepository.deleteImportFiles(tx, id)
            await this.importRepository.deleteImport(tx, userId, id)
        })

        if (data && approvedTransactions.length > 0) {
            const fromDate = new Date(Math.min(...approvedTransactions.map(t => t.date.getTime())))
            await this.accountBalanceService.recomputeAccountsAndSnapshots([data.financialAccountId], fromDate)
        }

        if (data) await eventBus.emit('import.deleted', { userId, data })
    }

    /**
     * Deletes every import owned by the authenticated user along with their associated rows.
     * @returns A promise that resolves when all imports have been deleted.
     */
    async deleteAllImports(): Promise<void> {
        const userId = this.context.currentUser.id
        const importIds = await this.importRepository.findAllImportIds(userId)

        for (const importId of importIds) {
            await this.deleteImport(importId)
        }
    }

    /**
     * Retrieves an import by its unique identifier for the authenticated user.
     * @param id The unique identifier of the import to retrieve.
     * @returns A promise that resolves to the import data, or null when the import is not found.
     */
    async getImportById(id: string): Promise<ImportData | null> {
        return this.importRepository.findById(this.context.currentUser.id, id)
    }

    /**
     * Updates an import with the supplied payload for the authenticated user.
     * @param id The unique identifier of the import to update.
     * @param payload The payload containing the fields to update.
     * @returns A promise that resolves to the updated import data.
     */
    async updateImport(id: string, payload: UpdateImportRequest): Promise<ImportData> {
        const userId = this.context.currentUser.id

        const data = await this.importRepository.update(userId, id, payload)
        await eventBus.emit('import.updated', { userId, data })

        return data
    }

    /**
     * Retrieves a paginated list of imports for the authenticated user using the supplied filters.
     * @param filters The filters to apply when retrieving imports.
     * @param skip The number of records to skip for pagination purposes.
     * @param take The number of records to take for pagination purposes.
     * @returns A promise that resolves to the list of imports matching the filters.
     */
    async getImports(filters: ImportFilters, skip: number, take: number): Promise<ImportData[]> {
        return this.importRepository.findMany(this.context.currentUser.id, filters, skip, take)
    }

    /**
     * Retrieves every pending, approved or rejected transaction for an import owned by the authenticated user.
     * @param id The unique identifier of the import whose transactions must be retrieved.
     * @returns A promise that resolves to the list of import transactions enriched with amounts and media.
     */
    async getImportTransactions(id: string): Promise<ImportTransactionDataResponse[]> {
        return this.importRepository.findImportTransactions(this.context.currentUser.id, id)
    }

    /**
     * Approves every transaction still awaiting review in an import, used when the import was
     * created with auto-approval so the user is not asked to confirm what they already opted out of
     * reviewing.
     * @param id The unique identifier of the import to approve in full.
     * @returns A promise that resolves to the completed import data.
     */
    async approveAllTransactions(id: string): Promise<ImportData> {
        const userId = this.context.currentUser.id

        await prisma.$transaction(async tx => {
            await this.importRepository.updateTransactionsStatus(tx, userId, id, 'IMPORT_PENDING', 'IMPORT_APPROVED')
        })

        return this.completeImport(id)
    }

    /**
     * Imports template data for the authenticated user based on the supplied template action.
     * @param action The template action requested by the caller.
     * @returns A promise that resolves to the seeded data when the action is supported, or null when the action is not recognised.
     */
    async importTemplates(action: string): Promise<CategoryData[] | null> {
        switch (action) {
            case 'categories':
                const categoryService = new CategoryService()
                return categoryService.createFromTemplate()
            default:
                return null
        }
    }

    /**
     * Returns whether an import exists for the authenticated user.
     * @param id The unique identifier of the import being checked.
     * @returns A promise that resolves to true when the import exists, or false otherwise.
     */
    async doesImportExist(id: string): Promise<boolean> {
        return this.importRepository.exists(this.context.currentUser.id, id)
    }
}
