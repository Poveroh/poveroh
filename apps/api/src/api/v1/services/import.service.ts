import prisma from '@poveroh/prisma'
import { buildWhere } from '../../../helpers/filter.helper'
import { TransactionHelper } from '../helpers/transaction.helper'
import { ImportHelper } from '../helpers/import.helper'
import { v4 as uuidv4 } from 'uuid'
import { MediaHelper } from '../../../helpers/media.helper'
import { BalanceHelper } from '../helpers/balance.helper'
import HowIParsedYourDataAlgorithm from '../helpers/parser.helper'
import {
    CreateImportRequest,
    ImportData,
    ImportFile,
    ImportFilters,
    TransactionActionEnum,
    TransactionStatusEnum,
    TransactionDataResponse,
    TransactionFilters
} from '@poveroh/types'
import { TransactionWithAmounts } from '@/types/transactions'
import { BaseService } from './base.service'

/**
 * Service class for managing imports, including creating, updating, deleting, and retrieving imports for the authenticated user
 * All methods automatically retrieve the user ID from the request context.
 */
export class ImportService extends BaseService {
    /**
     * Initializes the ImportService with the user ID from the request context
     * @param userId The ID of the authenticated user
     */
    constructor(userId: string) {
        super(userId, 'import')
    }

    /**
     * Creates or updates a transaction during the import flow
     * @param action The transaction action type
     * @param payload The transaction payload as a JSON string
     * @returns The created or updated transaction result
     */
    async handleImportTransaction(action: string, payload: string): Promise<unknown> {
        const userId = this.getUserId()
        const parsedData = JSON.parse(payload)
        return TransactionHelper.handleTransaction(action, parsedData, userId)
    }

    /**
     * Completes an import by approving transactions and removing pending or rejected ones
     * @param id The ID of the import to complete
     * @returns The updated import data response
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
            const approvedTransactions = (await tx.transaction.findMany({
                where: { status: 'IMPORT_APPROVED' as TransactionStatusEnum, importId: id, userId },
                include: { amounts: true }
            })) as TransactionWithAmounts[]

            await tx.transaction.updateMany({
                where: { status: 'IMPORT_APPROVED' as TransactionStatusEnum, importId: id, userId },
                data: {
                    status: 'APPROVED' as TransactionStatusEnum
                }
            })

            const flatAmounts = approvedTransactions.flatMap(t => t.amounts)
            const amountsToUpdate = flatAmounts.map(amount => TransactionHelper.createAmountData({ dbAmount: amount }))
            await BalanceHelper.updateAccountBalances(amountsToUpdate, undefined, tx)

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
     * Deletes an import and all associated records for the authenticated user
     * @param id The ID of the import to delete
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
     * @param id The ID of the import to retrieve
     * @returns The import data response if found, or null if not found
     */
    async getImportById(id: string): Promise<ImportData | null> {
        const userId = this.getUserId()
        return (await prisma.import.findFirst({
            where: { id, userId },
            include: { files: true }
        })) as unknown as ImportData | null
    }

    /**
     * Updates an import with the provided payload for the authenticated user
     * @param id The ID of the import to update
     * @param payload The payload to update the import with
     * @returns The updated import data response
     */
    async updateImport(id: string, payload: Record<string, unknown>): Promise<ImportData> {
        const userId = this.getUserId()
        return (await prisma.import.update({
            where: { id, userId },
            data: payload
        })) as unknown as ImportData
    }

    /**
     * Retrieves imports for the authenticated user based on the provided filters and pagination
     * @param filters The filters to apply to the import query
     * @param skip The number of imports to skip for pagination
     * @param take The number of imports to take for pagination
     * @returns An object containing the import data and the total count
     */
    async getImports(
        filters: ImportFilters,
        skip: number,
        take: number
    ): Promise<{ data: ImportData[]; total: number }> {
        const userId = this.getUserId()
        const where = {
            ...buildWhere(filters),
            userId
        }

        const [data, total] = await Promise.all([
            prisma.import.findMany({
                where,
                include: { files: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.import.count({ where })
        ])

        return {
            data: data as unknown as ImportData[],
            total
        }
    }

    /**
     * Retrieves pending transactions for an import based on filters
     * @param id The ID of the import to retrieve pending transactions for
     * @param filters The filters to apply to the transaction query
     * @returns The list of pending transactions
     */
    async getPendingTransactions(id: string, filters: TransactionFilters): Promise<TransactionDataResponse[]> {
        const userId = this.getUserId()
        const where = buildWhere(filters)

        return (await prisma.transaction.findMany({
            where: {
                ...where,
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
            include: { amounts: true },
            orderBy: { createdAt: 'desc' }
        })) as unknown as TransactionDataResponse[]
    }

    /**
     * Deletes a pending transaction with the specified ID for the authenticated user
     * @param transactionId The ID of the pending transaction to delete
     */
    async deletePendingTransaction(transactionId: string): Promise<void> {
        const userId = this.getUserId()
        await prisma.transaction.deleteMany({
            where: { id: transactionId, userId }
        })
    }

    /**
     * Updates pending transactions with the provided payload
     * @param payload The pending transactions payload as a JSON string
     * @returns The updated transactions
     */
    async editPendingTransactions(payload: string): Promise<TransactionDataResponse[]> {
        const parsedData: TransactionDataResponse[] = JSON.parse(payload)

        const updatedTransactions = await prisma.$transaction(async tx => {
            const results = []

            for (const transaction of parsedData) {
                const { amounts, media, ...transactionData } = transaction

                const updatedTransaction = await tx.transaction.update({
                    where: { id: transaction.id },
                    data: transactionData
                })

                if (media && Array.isArray(media)) {
                    await tx.transactionMedia.deleteMany({
                        where: { transactionId: transaction.id }
                    })

                    if (media.length > 0) {
                        await tx.transactionMedia.createMany({
                            data: media.map(transactionMedia => ({
                                transactionId: transaction.id,
                                filename: transactionMedia.filename,
                                filetype: transactionMedia.filetype,
                                path: transactionMedia.path
                            }))
                        })
                    }
                }

                results.push(updatedTransaction)
            }

            return results
        })

        return updatedTransactions as unknown as TransactionDataResponse[]
    }

    /**
     * Creates an import with the provided payload and uploaded files
     * @param payload The create import request payload
     * @param files The uploaded files
     * @returns The created import data response
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
        const allTransactions = fileResults.flatMap(fileResult => fileResult.transactions)

        const parsedTransactions = await ImportHelper.normalizeTransaction(
            userId,
            payload.financialAccountId,
            allTransactions
        )

        const importFiles: ImportFile[] = savedFiles.map((path, idx) => ({
            id: uuidv4(),
            importId,
            filename: files[idx]?.originalname || '',
            filetype: 'CSV',
            path,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
        }))

        const imports = await prisma.import.create({
            data: {
                id: importId,
                userId,
                financialAccountId: payload.financialAccountId,
                title: `Import at ${now.toISOString()}`,
                status: 'IMPORT_PENDING' as TransactionStatusEnum,
                createdAt: now
            }
        })

        await prisma.importFile.createMany({ data: importFiles })

        await prisma.transaction.createMany({
            data: parsedTransactions.map(({ amounts, ...transaction }) => ({
                ...transaction,
                importId
            }))
        })

        const allAmounts = parsedTransactions.flatMap(transaction =>
            transaction.amounts.map((amount: any) => ({
                transactionId: amount.transactionId,
                amount: amount.amount,
                currency: amount.currency,
                action: amount.action as TransactionActionEnum,
                financialAccountId: amount.financialAccountId,
                importReference: amount.importReference
            }))
        )

        if (allAmounts.length > 0) {
            await prisma.amount.createMany({ data: allAmounts })
        }

        return {
            ...({
                ...(imports as unknown as Record<string, unknown>),
                files: importFiles,
                transactions: parsedTransactions
            } as unknown as ImportData)
        }
    }

    /**
     * Imports template data based on the specified action
     * @param action The template import action
     * @returns Whether the import succeeded
     */
    async importTemplates(action: string): Promise<boolean> {
        const userId = this.getUserId()
        switch (action) {
            case 'categories':
                await ImportHelper.importCategoriesFromTemplate(userId)
                break
            default:
                return false
        }

        return true
    }
}
