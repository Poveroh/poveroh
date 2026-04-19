import prisma, { Prisma } from '@poveroh/prisma'
import { buildWhere } from '../../../helpers/filter.helper'
import { ImportHelper } from '../helpers/import.helper'
import { v4 as uuidv4 } from 'uuid'
import { MediaHelper } from '../../../helpers/media.helper'
import { BalanceHelper } from '../helpers/balance.helper'
import HowIParsedYourDataAlgorithm from '../helpers/parser.helper'
import {
    Amount,
    ApproveImportTransactionsRequest,
    CreateImportRequest,
    ImportData,
    ImportFilters,
    ImportTransactionDataResponse,
    TransactionStatusEnum,
    CategoryData,
    UpdateImportRequest
} from '@poveroh/types'
import { BaseService } from './base.service'
import { CategoryService } from './category.service'
import { toBoolean } from '@poveroh/utils'

/**
 * Service class for managing imports, including creating, updating, deleting, and retrieving imports for the authenticated user
 * All methods automatically retrieve the user ID from the request context.
 */
export class ImportService extends BaseService {
    constructor(userId: string) {
        super(userId, 'import')
    }

    /**
     * Completes an import by approving transactions and removing pending or rejected ones
     */
    async completeImport(id: string): Promise<ImportData> {
        const userId = this.getUserId()
        const deletePattern = {
            importId: id,
            userId,
            status: {
                in: ['IMPORT_PENDING', 'IMPORT_REJECTED'] as TransactionStatusEnum[]
            }
        }

        return (await prisma.$transaction(async tx => {
            const approvedTransactions = await tx.transaction.findMany({
                where: { status: 'IMPORT_APPROVED' as TransactionStatusEnum, importId: id, userId },
                include: { amounts: true }
            })

            await tx.transaction.updateMany({
                where: { status: 'IMPORT_APPROVED' as TransactionStatusEnum, importId: id, userId },
                data: {
                    status: 'APPROVED' as TransactionStatusEnum
                }
            })

            const approvedAmounts = approvedTransactions.flatMap(t => t.amounts) as unknown as Amount[]
            await BalanceHelper.updateAccountBalances(approvedAmounts, undefined, tx)

            await tx.amount.deleteMany({
                where: {
                    transaction: deletePattern
                }
            })

            await tx.transaction.deleteMany({
                where: deletePattern
            })

            return tx.import.update({
                where: { id, userId },
                data: {
                    status: 'APPROVED' as TransactionStatusEnum
                }
            })
        })) as unknown as ImportData
    }

    /**
     * Rolls back a completed import: moves the import and its approved transactions back to pending,
     * and reverts the balance changes that were applied when the import was completed.
     */
    async rollbackImport(id: string): Promise<ImportData> {
        const userId = this.getUserId()

        return (await prisma.$transaction(async tx => {
            const existing = await tx.import.findFirst({ where: { id, userId } })

            if (!existing) {
                throw new Error('Import not found')
            }

            if (existing.status !== 'APPROVED') {
                throw new Error('Only completed imports can be rolled back')
            }

            // Fetch the transactions that were approved when the import was completed,
            // so we can revert the corresponding account balances.
            const approvedTransactions = await tx.transaction.findMany({
                where: { importId: id, userId, status: 'APPROVED' },
                include: { amounts: true }
            })

            // Revert balances by applying the opposite action (INCOME -> EXPENSES and vice versa).
            const reversalAmounts = approvedTransactions.flatMap(t =>
                t.amounts.map(a => ({
                    ...a,
                    action: a.action === 'INCOME' ? 'EXPENSES' : 'INCOME'
                }))
            ) as unknown as Amount[]

            if (reversalAmounts.length > 0) {
                await BalanceHelper.updateAccountBalances(reversalAmounts, undefined, tx)
            }

            await tx.transaction.updateMany({
                where: { importId: id, userId, status: 'APPROVED' },
                data: { status: 'IMPORT_PENDING' }
            })

            return tx.import.update({
                where: { id, userId },
                data: { status: 'IMPORT_PENDING' }
            })
        })) as unknown as ImportData
    }

    /**
     * Bulk approve or reject import transactions
     */
    async approveImportTransactions(
        importId: string,
        payload: ApproveImportTransactionsRequest
    ): Promise<ImportTransactionDataResponse[]> {
        const userId = this.getUserId()
        const allowedStatuses: TransactionStatusEnum[] = ['IMPORT_APPROVED', 'IMPORT_REJECTED']

        await prisma.$transaction(async tx => {
            for (const item of payload.transactions) {
                if (!allowedStatuses.includes(item.status)) {
                    throw new Error(`Invalid status: ${item.status}`)
                }

                await tx.transaction.update({
                    where: { id: item.transactionId, importId, userId },
                    data: { status: item.status }
                })
            }
        })

        return this.getImportTransactions(importId)
    }

    /**
     * Deletes an import and all associated records for the authenticated user
     */
    async deleteImport(id: string): Promise<void> {
        const userId = this.getUserId()
        const transactions = await prisma.transaction.findMany({
            where: {
                importId: id,
                userId,
                status: {
                    in: [
                        'IMPORT_PENDING' as TransactionStatusEnum,
                        'IMPORT_REJECTED' as TransactionStatusEnum,
                        'IMPORT_APPROVED' as TransactionStatusEnum
                    ]
                }
            },
            select: { id: true }
        })
        const transactionIds = transactions.map(t => t.id)

        if (transactionIds.length > 0) {
            await prisma.amount.deleteMany({
                where: { transactionId: { in: transactionIds } }
            })
        }

        await prisma.$transaction([
            prisma.transaction.deleteMany({
                where: { importId: id, userId }
            }),
            prisma.importFile.deleteMany({
                where: { importId: id }
            }),
            prisma.import.delete({
                where: { id, userId }
            })
        ])
    }

    /**
     * Deletes all imports for the authenticated user
     */
    async deleteAllImports(): Promise<void> {
        const userId = this.getUserId()
        const imports = await prisma.import.findMany({
            where: { userId },
            select: { id: true }
        })

        for (const item of imports) {
            await this.deleteImport(item.id)
        }
    }

    /**
     * Retrieves an import by its ID for the authenticated user
     */
    async getImportById(id: string): Promise<ImportData | null> {
        const userId = this.getUserId()
        return (await prisma.import.findFirst({
            where: { id, userId },
            include: { files: true, transactions: { include: { amounts: true, media: true } } }
        })) as unknown as ImportData | null
    }

    /**
     * Updates an import with the provided payload for the authenticated user
     */
    async updateImport(id: string, payload: UpdateImportRequest): Promise<ImportData> {
        const userId = this.getUserId()
        return (await prisma.import.update({
            where: { id, userId },
            data: payload
        })) as unknown as ImportData
    }

    /**
     * Retrieves imports for the authenticated user based on the provided filters and pagination
     */
    async getImports(filters: ImportFilters, skip: number, take: number): Promise<ImportData[]> {
        const userId = this.getUserId()

        const { includeTransactions, ...filterRest } = filters

        const shouldIncludeTransactions = toBoolean(String(includeTransactions))

        const whereCondition = buildWhere({ ...filterRest, deletedAt: null, userId }, ['title'])

        return prisma.import.findMany({
            where: whereCondition,
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
     * Retrieves all transactions (pending, approved, rejected) for an import
     */
    async getImportTransactions(id: string): Promise<ImportTransactionDataResponse[]> {
        const userId = this.getUserId()

        return (await prisma.transaction.findMany({
            where: {
                importId: id,
                userId,
                status: {
                    in: [
                        'IMPORT_PENDING' as TransactionStatusEnum,
                        'IMPORT_APPROVED' as TransactionStatusEnum,
                        'IMPORT_REJECTED' as TransactionStatusEnum
                    ]
                }
            },
            omit: { userId: true, importId: true, deletedAt: true },
            include: { amounts: true, media: true },
            orderBy: { createdAt: 'desc' }
        })) as unknown as ImportTransactionDataResponse[]
    }

    /**
     * Creates an import with the provided payload and uploaded files
     */
    async createImport(payload: CreateImportRequest, files: Express.Multer.File[]): Promise<ImportData> {
        const userId = this.getUserId()
        const importId = uuidv4()
        const now = new Date()
        const parser = new HowIParsedYourDataAlgorithm()

        const fileResults = await Promise.all(
            files.map(async file => {
                const content = file.buffer.toString('utf-8')
                const filePath = await MediaHelper.handleUpload(file, `${userId}/imports/${importId}`)
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
            await tx.import.create({
                data: {
                    id: importId,
                    userId,
                    financialAccountId: payload.financialAccountId,
                    title: `Import at ${now.toLocaleString()}`,
                    status: 'IMPORT_PENDING' as TransactionStatusEnum,
                    createdAt: now
                }
            })

            if (importFiles.length > 0) {
                await tx.importFile.createMany({ data: importFiles })
            }

            if (transactionsToCreate.length > 0) {
                await tx.transaction.createMany({ data: transactionsToCreate })
            }

            if (amountsToCreate.length > 0) {
                await tx.amount.createMany({ data: amountsToCreate })
            }
        })

        const created = await prisma.import.findUniqueOrThrow({
            where: { id: importId, userId },
            include: { files: true, transactions: { include: { amounts: true, media: true } } }
        })

        return created as unknown as ImportData
    }

    /**
     * Imports template data based on the specified action
     */
    async importTemplates(action: string): Promise<CategoryData[] | null> {
        const userId = this.getUserId()
        switch (action) {
            case 'categories':
                const categoryService = new CategoryService(userId)
                return await categoryService.createFromTemplate()
            default:
                return null
        }
    }

    async doesImportExist(id: string): Promise<boolean> {
        const userId = this.getUserId()
        const count = await prisma.import.count({
            where: { id, userId, deletedAt: null }
        })
        return count > 0
    }
}
