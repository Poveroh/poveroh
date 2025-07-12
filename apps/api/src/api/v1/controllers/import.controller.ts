import { Request, Response } from 'express'
import prisma from '@poveroh/prisma'
import { TransactionHelper } from '../helpers/transaction.helper'
import { buildWhere } from '../../../helpers/filter.helper'
import { FileType, IFilterOptions, IImportsFile, TransactionStatus, ITransactionFilters } from '@poveroh/types'
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

    //POST /:id
    static async save(req: Request, res: Response) {
        try {
            const { id } = req.params
            const { data } = req.body

            if (!id || !data) {
                res.status(400).json({ message: 'Missing import ID or data' })
                return
            }

            const parsedData = JSON.parse(data)

            const imports = await prisma.imports.update({
                where: { id },
                data: parsedData
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

            await prisma.imports.delete({
                where: { id }
            })

            res.status(200).json(true)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    //GET /
    static async read(req: Request, res: Response) {
        try {
            const rawFilters = req.query['filter'] || {}
            const rawOptions = req.query['options'] || {}

            const filters = rawFilters as unknown as ITransactionFilters
            const options = rawOptions as unknown as IFilterOptions

            const skip = isNaN(Number(options.skip)) ? 0 : Number(options.skip)
            const take = isNaN(Number(options.take)) ? undefined : Number(options.take)

            const where = {
                ...buildWhere(filters),
                ...(filters.fromDate && {
                    date: {
                        ...(filters.date || {}),
                        gte: new Date(filters.fromDate)
                    }
                })
            }

            const queryOptions: any = {
                where,
                include: { amounts: true },
                orderBy: { created_at: 'desc' },
                skip
            }

            if (take && take > 0) {
                queryOptions.take = take
            }

            const data = await prisma.imports.findMany(queryOptions)

            res.status(200).json(data)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async deletePendingTransaction(req: Request, res: Response) {
        try {
            const { transaction_id } = req.params

            if (!transaction_id) {
                res.status(400).json({ message: 'Missing transaction ID' })
                return
            }
            await prisma.transactions.delete({
                where: { id: transaction_id }
            })

            res.status(200).json(true)
        } catch (error) {
            logger.error(error)
            res.status(500).json({ message: 'An error occurred', error })
        }
    }

    static async editPendingTransaction(req: Request, res: Response) {
        try {
            const { id } = req.params
            const data = req.body

            if (!id || !data) {
                res.status(400).json({ message: 'Missing transaction ID or data' })
                return
            }

            const parsedData = JSON.parse(data)

            const transaction = await prisma.transactions.update({
                where: { id },
                data: parsedData
            })

            res.status(200).json(transaction)
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
            const bank_account_id: string = req.body.bank_account_id
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
            const parsedTransactions = ImportHelper.normalizeTransaction(userId, bank_account_id, allTransactions)

            const importFiles: IImportsFile[] = savedFiles.map((path, idx) => ({
                id: uuidv4(),
                import_id: importId,
                filename: files[idx]?.originalname || '',
                filetype: FileType.CSV,
                path,
                created_at: now.toISOString()
            }))

            const imports = await prisma.imports.create({
                data: {
                    id: importId,
                    user_id: userId,
                    title: '',
                    status: TransactionStatus.IMPORT_PENDING,
                    created_at: now
                }
            })

            await prisma.import_files.createMany({ data: importFiles })

            await prisma.transactions.createMany({
                data: parsedTransactions.map(({ amounts, ...transaction }) => ({
                    ...transaction,
                    import_id: importId
                }))
            })

            const allAmounts = parsedTransactions.flatMap(transaction =>
                transaction.amounts.map(amount => ({
                    ...amount,
                    transaction_id: transaction.id
                }))
            )

            if (allAmounts.length > 0) {
                await prisma.amounts.createMany({ data: allAmounts })
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
