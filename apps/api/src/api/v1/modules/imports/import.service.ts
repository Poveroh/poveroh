import prisma, { Prisma } from '@poveroh/prisma'
import { v4 as uuidv4 } from 'uuid'
import type {
    Amount,
    ApproveImportTransactionsRequest,
    CategoryData,
    CreateImportRequest,
    ImportData,
    ImportFilters,
    ImportTransactionDataResponse,
    TransactionStatusEnum,
    UpdateImportRequest
} from '@poveroh/types'
import { BadRequestError, NotFoundError } from '@/utils'
import { BalanceHelper } from '../../helpers/balance.helper'
import { BaseService } from '../base/base.service'
import { CategoryService } from '../categories/category.service'
import { eventBus } from '../../events/event-bus'
import { ImportHelper } from '../../helpers/import.helper'
import { ImportRepository } from './import.repository'
import HowIParsedYourDataAlgorithm from '../../helpers/parser.helper'

/**
 * Service class for managing imports, including creating, updating, deleting and retrieving imports for the authenticated user.
 * All methods automatically retrieve the user ID from the request context.
 */
export class ImportService extends BaseService {
    private readonly importRepository = new ImportRepository()

    constructor() {
        super('import')
    }

    /**
     * Completes an import by approving its transactions, applying the resulting balance changes and removing the pending or rejected rows.
     * @param id The unique identifier of the import to complete.
     * @returns A promise that resolves to the updated import data.
     */
    async completeImport(id: string): Promise<ImportData> {
        const userId = this.context.currentUser.id

        const data = await prisma.$transaction(async tx => {
            const approvedTransactions = await this.importRepository.findTransactionsByStatusWithAmounts(
                tx,
                userId,
                id,
                'IMPORT_APPROVED'
            )

            await this.importRepository.updateTransactionsStatus(tx, userId, id, 'IMPORT_APPROVED', 'APPROVED')

            const approvedAmounts = approvedTransactions.flatMap(t => t.amounts)
            await BalanceHelper.updateAccountBalances(approvedAmounts, undefined, tx)

            await this.importRepository.deletePendingOrRejectedAmounts(tx, userId, id)
            await this.importRepository.deletePendingOrRejectedTransactions(tx, userId, id)

            return this.importRepository.updateStatus(tx, userId, id, 'APPROVED')
        })

        await eventBus.emit('import.updated', { userId, data })
        return data
    }

    /**
     * Rolls back a completed import, reverting its approved transactions to pending and undoing the balance changes that were applied when the import was completed.
     * @param id The unique identifier of the import to roll back.
     * @returns A promise that resolves to the updated import data.
     */
    async rollbackImport(id: string): Promise<ImportData> {
        const userId = this.context.currentUser.id

        const data = await prisma.$transaction(async tx => {
            const existing = await tx.import.findFirst({ where: { id, userId } })
            if (!existing) throw new NotFoundError('Import not found')
            if (existing.status !== 'APPROVED') {
                throw new BadRequestError('Only completed imports can be rolled back')
            }

            const approvedTransactions = await this.importRepository.findTransactionsByStatusWithAmounts(
                tx,
                userId,
                id,
                'APPROVED'
            )

            const reversalAmounts = approvedTransactions.flatMap(t =>
                t.amounts.map(a => ({
                    ...a,
                    action: a.action === 'INCOME' ? 'EXPENSES' : 'INCOME'
                }))
            ) as Amount[]

            if (reversalAmounts.length > 0) {
                await BalanceHelper.updateAccountBalances(reversalAmounts, undefined, tx)
            }

            await this.importRepository.updateTransactionsStatus(tx, userId, id, 'APPROVED', 'IMPORT_PENDING')

            return this.importRepository.updateStatus(tx, userId, id, 'IMPORT_PENDING')
        })

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
     * Deletes an import and every associated transaction, amount and file row for the authenticated user.
     * @param id The unique identifier of the import to delete.
     * @returns A promise that resolves when the import has been deleted.
     */
    async deleteImport(id: string): Promise<void> {
        const userId = this.context.currentUser.id

        const data = await this.getImportById(id)
        const transactionIds = await this.importRepository.findImportTransactionIds(userId, id)

        await prisma.$transaction(async tx => {
            await this.importRepository.deleteAmountsByTransactionIds(tx, transactionIds)
            await this.importRepository.deleteTransactionsByImport(tx, userId, id)
            await this.importRepository.deleteImportFiles(tx, id)
            await this.importRepository.deleteImport(tx, userId, id)
        })

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
     * Creates an import with the supplied payload and uploaded files, parsing the file contents and persisting derived transactions and amounts.
     * @param payload The data required to create a new import.
     * @param files The uploaded files containing the transactions to import.
     * @returns A promise that resolves to the newly created import data.
     */
    async createImport(payload: CreateImportRequest, files: Express.Multer.File[]): Promise<ImportData> {
        const userId = this.context.currentUser.id
        const importId = uuidv4()
        const now = new Date()
        const parser = new HowIParsedYourDataAlgorithm()

        const fileResults = await Promise.all(
            files.map(async file => {
                const content = file.buffer.toString('utf-8')
                const filePath = await this.media.saveFile(importId, file)
                const parsed = await parser.parseCSVFile(content)

                return {
                    filePath,
                    originalname: file.originalname,
                    transactions: parsed.transactions
                }
            })
        )

        const savedFiles = fileResults.map(fileResult => fileResult.filePath)
        const allRawTransactions = fileResults.flatMap(fileResult => fileResult.transactions)

        const { transactions: transactionsToCreate, amounts: amountsToCreate } =
            await ImportHelper.normalizeTransaction(userId, payload.financialAccountId, importId, allRawTransactions)

        const importFiles: Prisma.ImportFileCreateManyInput[] = savedFiles.map((path, idx) => ({
            importId,
            filename: files[idx]?.originalname || '',
            filetype: 'CSV',
            path
        }))

        await prisma.$transaction(async tx => {
            await this.importRepository.create(tx, {
                id: importId,
                userId,
                financialAccountId: payload.financialAccountId,
                title: `Import at ${now.toLocaleString()}`,
                status: 'IMPORT_PENDING',
                createdAt: now
            })

            await this.importRepository.createImportFiles(tx, importFiles)
            await this.importRepository.createTransactions(tx, transactionsToCreate)
            await this.importRepository.createAmounts(tx, amountsToCreate)
        })

        const data = await this.importRepository.findByIdOrThrow(userId, importId)
        await eventBus.emit('import.created', { userId, data })

        return data
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
