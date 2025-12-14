import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { TransactionHelper } from '../helpers/transaction.helper'
import { buildWhere } from '../../../helpers/filter.helper'
import { FileType, IImportsFile, TransactionStatus, ITransactionFilters, ITransaction } from '@poveroh/types'
import logger from '../../../utils/logger'
import HowIParsedYourDataAlgorithm from '../helpers/parser.helper'
import { ImportHelper } from '../helpers/import.helper'
import { v4 as uuidv4 } from 'uuid'
import { MediaHelper } from '../../../helpers/media.helper'

export class ImportController {
    //POST /
    static async add(req: Request, res: Response) {
        try {
            const { data, action } = req.body

            if (!data || !action) {
                res.status(400).json({ message: 'Data or action not provided' })
                return
            }

            const parsedData = JSON.parse(data)
            const userId = req.user.id

            const result = await TransactionHelper.handleTransaction(action, parsedData, userId)
            res.status(200).json(result)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //PUT /:id
    static async complete(req: Request, res: Response) {
        try {
            const { id } = req.params

            const deletePattern = {
                importId: id,
                status: {
                    in: [TransactionStatus.IMPORT_PENDING, TransactionStatus.IMPORT_REJECTED]
                }
            }

            const imports = await prisma.$transaction(async tx => {
                // Update transactions
                await tx.transaction.updateMany({
                    where: { status: TransactionStatus.IMPORT_APPROVED, importId: id },
                    data: {
                        status: TransactionStatus.APPROVED
                    }
                })

                // Delete amounts and transactions for both statuses in a single transaction, but separate deleteMany calls are required
                await tx.amount.deleteMany({
                    where: {
                        transaction: deletePattern
                    }
                })

                await tx.transaction.deleteMany({
                    where: deletePattern
                })

                // Update import
                return tx.import.update({
                    where: { id },
                    data: {
                        status: TransactionStatus.APPROVED
                    }
                })
            })

            res.status(200).json(imports)
        } catch (error) {
            logger.error(error)
            res.status(500).json({
                message: 'An error occurred while updating the import',
                error: process.env.NODE_ENV === 'production' ? undefined : error
            })
        }
    }

    //DELETE /:id
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params

            if (!id) {
                res.status(400).json({ message: 'Missing import ID' })
                return
            }

            const transactions = await prisma.transaction.findMany({
                where: { importId: id },
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
                    where: { importId: id }
                }),
                prisma.importFile.deleteMany({
                    where: { importId: id }
                }),
                prisma.import.delete({
                    where: { id }
                })
            ])

            res.status(200).json(true)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //GET /
    static async read(req: Request, res: Response) {
        try {
            const filters = req.query as unknown as IImportsFile
            const skip = Number(req.query.skip) || 0
            const take = Number(req.query.take) || 20

            const where = buildWhere(filters)

            const data = await prisma.import.findMany({
                where,
                include: { files: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            })

            res.status(200).json(data)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async readPendingTransactions(req: Request, res: Response) {
        try {
            const { id } = req.params

            const filters = req.query as unknown as ITransactionFilters

            const where = buildWhere(filters)

            const data = await prisma.transaction.findMany({
                where: {
                    ...where,
                    importId: id,
                    status: {
                        in: [
                            TransactionStatus.IMPORT_PENDING,
                            TransactionStatus.IMPORT_APPROVED,
                            TransactionStatus.IMPORT_REJECTED
                        ]
                    }
                },
                include: { amounts: true },
                orderBy: { createdAt: 'desc' }
            })

            res.status(200).json(data)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async deletePendingTransaction(req: Request, res: Response) {
        try {
            const { transactionId } = req.params

            if (!transactionId) {
                res.status(400).json({ message: 'Missing transaction ID' })
                return
            }
            await prisma.transaction.delete({
                where: { id: transactionId }
            })

            res.status(200).json(true)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async editPendingTransaction(req: Request, res: Response) {
        try {
            const { data } = req.body

            const parsedData: ITransaction[] = JSON.parse(data)

            if (!Array.isArray(parsedData) || parsedData.length === 0) {
                res.status(400).json({ message: 'Missing or empty transactions array' })
                return
            }

            const updatedTransactions = await prisma.$transaction(async tx => {
                const results = []

                for (const t of parsedData) {
                    const { amounts, action, media, ...transactionData } = t

                    // Update transaction data (excluding media)
                    const updatedTransaction = await tx.transaction.update({
                        where: { id: t.id },
                        data: transactionData
                    })

                    // Handle media separately if provided
                    if (media && Array.isArray(media)) {
                        // Delete existing media
                        await tx.transactionMedia.deleteMany({
                            where: { transactionId: t.id }
                        })

                        // Create new media records
                        if (media.length > 0) {
                            await tx.transactionMedia.createMany({
                                data: media.map(m => ({
                                    transactionId: t.id,
                                    filename: m.filename,
                                    filetype: m.filetype,
                                    path: m.path
                                }))
                            })
                        }
                    }

                    results.push(updatedTransaction)
                }

                return results
            })

            res.status(200).json(updatedTransactions)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    /**
     * @summary Parse uploaded files and create transactions
     * @route POST /api/v1/imports/read-file
     *
     * This controller method performs the following steps:
     * 1. Validates that files are provided in the request.
     * 2. Uploads each file and parses its content to extract transactions using a heuristic parser.
     * 3. Normalizes and prepares transaction data for database insertion.
     * 4. Creates import and import file records in the database.
     * 5. Inserts parsed transactions and their associated amounts into the database.
     * 6. Returns a JSON response with import details, files, and transactions.
     *
     * @param req - Express request object.
     * @param res - Express response object used to send the result or error.
     * @returns A JSON response with import metadata, file information, and parsed transactions.
     *
     * @remarks
     * - Expects files to be uploaded via multipart/form-data.
     * - Uses Multer for file handling and Prisma for database operations.
     * - Handles errors gracefully and logs them.
     */
    static async parseFile(req: Request, res: Response) {
        try {
            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                res.status(400).json({ message: 'No files provided' })
                return
            }

            const files = req.files as Express.Multer.File[]
            const financialAccountId: string = req.body.financialAccountId
            const userId = req.user.id
            const importId = uuidv4()
            const now = new Date()

            // This algorithm parses the CSV files and extracts transactions dinamically
            const parser = new HowIParsedYourDataAlgorithm()

            // Upload files and parse transactions in parallel
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

            const savedFiles = fileResults.map(f => f.filePath)
            const allTransactions = fileResults.flatMap(f => f.transactions)

            /*
             * Normalize transactions to match the expected format for the database.
             * The algorithm check back existing transactions and subscription to fill new transactions with the correct data.
             */
            const parsedTransactions = await ImportHelper.normalizeTransaction(
                userId,
                financialAccountId,
                allTransactions
            )

            const importFiles: IImportsFile[] = savedFiles.map((path, idx) => ({
                id: uuidv4(),
                importId: importId,
                filename: files[idx]?.originalname || '',
                filetype: FileType.CSV,
                path,
                createdAt: now.toISOString()
            }))

            const imports = await prisma.import.create({
                data: {
                    id: importId,
                    userId: userId,
                    financialAccountId: financialAccountId,
                    title: 'Import at ' + now.toISOString(),
                    status: TransactionStatus.IMPORT_PENDING,
                    createdAt: now
                }
            })

            await prisma.importFile.createMany({ data: importFiles })

            await prisma.transaction.createMany({
                data: parsedTransactions.map(({ amounts, action, ...transaction }) => ({
                    ...transaction,
                    importId: importId
                }))
            })

            const allAmounts = parsedTransactions.flatMap(transaction =>
                transaction.amounts.map(amount => ({
                    transactionId: amount.transactionId,
                    amount: amount.amount,
                    currency: amount.currency,
                    action: amount.action as 'EXPENSES' | 'INCOME',
                    financialAccountId: amount.financialAccountId,
                    importReference: amount.importReference
                }))
            )

            if (allAmounts.length > 0) {
                await prisma.amount.createMany({ data: allAmounts })
            }

            res.status(200).json({
                ...imports,
                files: importFiles,
                transactions: parsedTransactions
            })
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }
}
