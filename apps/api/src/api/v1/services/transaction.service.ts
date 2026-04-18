import prisma, { Prisma } from '@poveroh/prisma'
import moment from 'moment-timezone'
import { buildWhere } from '../../../helpers/filter.helper'
import {
    Amount,
    CreateTransactionRequest,
    CreateUpdateTransactionRequest,
    CurrencyEnum,
    FilterOptions,
    QueryTransactionFilters,
    TransactionActionEnum,
    TransactionAmount,
    TransactionData,
    TransactionFilters,
    UpdateTransactionRequest
} from '@poveroh/types'
import { CreateTransactionRequestSchema, UpdateTransactionRequestSchema } from '@poveroh/schemas'
import { BaseService } from './base.service'
import { BalanceHelper } from '../helpers/balance.helper'

/**
 * Service for managing transactions (create, update, delete, read).
 * `CreateUpdateTransactionRequest` is a union of create (all fields required)
 * and update (all optional). The presence of `transactionId` selects the branch.
 */
export class TransactionService extends BaseService {
    constructor(userId: string) {
        super(userId, 'transaction')
    }

    async handleTransaction(
        payload: CreateUpdateTransactionRequest,
        files?: Express.Multer.File[],
        transactionId?: string
    ) {
        const userId = this.getUserId()

        if (transactionId) {
            const parsed = UpdateTransactionRequestSchema.parse(payload) as UpdateTransactionRequest
            return this.updateTransaction(transactionId, parsed, userId, files)
        }

        const parsed = CreateTransactionRequestSchema.parse(payload) as CreateTransactionRequest
        switch (parsed.action) {
            case 'TRANSFER':
                return this.createTransfer(parsed, userId, files)
            case 'INCOME':
            case 'EXPENSES':
                return this.createStandard(parsed, userId, files)
            default:
                throw new Error(`Invalid transaction action: ${parsed.action}`)
        }
    }

    // ------------------------------------------------------------------ //
    // CREATE
    // ------------------------------------------------------------------ //

    private async createStandard(payload: CreateTransactionRequest, userId: string, files?: Express.Multer.File[]) {
        const normalized = this.normalize(payload) as Prisma.TransactionCreateManyInput
        let resultId = ''

        await prisma.$transaction(
            async tx => {
                const transaction = await tx.transaction.create({
                    data: { ...normalized, userId }
                })

                const amountsData = this.buildAmounts(transaction.id, payload.amounts, payload.currency)
                await this.persistAmounts(tx, transaction.id, amountsData)
                resultId = transaction.id
            },
            { timeout: 30000 }
        )

        await this.saveTransactionMedia(resultId, files)
        return this.getTransactionById(resultId)
    }

    private async createTransfer(payload: CreateTransactionRequest, userId: string, files?: Express.Multer.File[]) {
        const { fromAmount, toAmount } = this.splitTransferAmounts(payload.amounts)
        const utcDate = await this.resolveUtcDate(payload.date, userId)
        const normalized = { ...this.normalize(payload), userId } as Prisma.TransactionCreateManyInput
        let transferId = ''
        let transactionIds: string[] = []

        await prisma.$transaction(
            async tx => {
                const transactions = await tx.transaction.createManyAndReturn({
                    data: [normalized, normalized]
                })

                const amountsData = this.buildTransferAmounts(
                    transactions[0].id,
                    transactions[1].id,
                    fromAmount,
                    toAmount,
                    payload.currency
                )
                await tx.amount.createMany({ data: amountsData })
                await BalanceHelper.updateAccountBalances(amountsData as unknown as Amount[], undefined, tx)

                const transfer = await tx.transfer.create({
                    data: {
                        transferDate: utcDate,
                        note: payload.note,
                        fromTransactionId: transactions[0].id,
                        toTransactionId: transactions[1].id,
                        userId
                    }
                })

                await tx.transaction.updateMany({
                    where: { id: { in: [transactions[0].id, transactions[1].id] } },
                    data: { transferId: transfer.id }
                })

                transferId = transfer.id
                transactionIds = [transactions[0].id, transactions[1].id]
            },
            { timeout: 30000 }
        )

        await Promise.all(transactionIds.map(id => this.saveTransactionMedia(id, files)))
        return this.fetchTransferTransactionByTransferId(transferId)
    }

    // ------------------------------------------------------------------ //
    // UPDATE
    // ------------------------------------------------------------------ //

    private async updateTransaction(
        transactionId: string,
        payload: UpdateTransactionRequest,
        userId: string,
        files?: Express.Multer.File[]
    ) {
        const existing = await prisma.transaction.findFirst({
            where: { id: transactionId, userId },
            include: { amounts: true }
        })

        if (!existing) {
            throw new Error(`Transaction with id ${transactionId} not found`)
        }

        const effectiveAction = (payload.action ?? existing.action) as TransactionActionEnum
        const updateData = this.normalize(payload)
        const hasAmounts = Array.isArray(payload.amounts) && payload.amounts.length > 0
        const currency = (payload.currency ?? existing.amounts[0]?.currency) as CurrencyEnum

        await prisma.$transaction(
            async tx => {
                if (Object.keys(updateData).length > 0) {
                    await tx.transaction.update({
                        where: { id: transactionId, userId },
                        data: updateData
                    })
                }

                if (!hasAmounts) return

                const amountsData =
                    effectiveAction === 'TRANSFER'
                        ? (() => {
                              const { fromAmount, toAmount } = this.splitTransferAmounts(payload.amounts!)
                              return this.buildTransferAmounts(
                                  transactionId,
                                  transactionId,
                                  fromAmount,
                                  toAmount,
                                  currency
                              )
                          })()
                        : this.buildAmounts(transactionId, payload.amounts!, currency)

                await this.persistAmounts(tx, transactionId, amountsData, existing.amounts)
            },
            { timeout: 30000 }
        )

        await this.saveTransactionMedia(transactionId, files)

        if (existing.transferId) {
            return this.fetchTransferTransactionByTransferId(existing.transferId)
        }
        return this.getTransactionById(transactionId)
    }

    // ------------------------------------------------------------------ //
    // HELPERS
    // ------------------------------------------------------------------ //

    private splitTransferAmounts(amounts: TransactionAmount[]) {
        const fromAmount = amounts.find(a => a.action === 'EXPENSES')!
        const toAmount = amounts.find(a => a.action === 'INCOME')!
        return { fromAmount, toAmount }
    }

    private async resolveUtcDate(date: string, userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { timezone: true }
        })
        if (!user) {
            throw new Error('User not found')
        }
        return moment.tz(date, user.timezone).utc().toISOString()
    }

    private buildAmounts(
        transactionId: string,
        amounts: TransactionAmount[],
        currency: CurrencyEnum
    ): Prisma.AmountCreateManyInput[] {
        return amounts.map(a => ({
            transactionId,
            amount: a.amount,
            currency,
            action: a.action,
            financialAccountId: a.financialAccountId
        }))
    }

    private buildTransferAmounts(
        fromTransactionId: string,
        toTransactionId: string,
        fromAmount: TransactionAmount,
        toAmount: TransactionAmount,
        currency: CurrencyEnum
    ): Prisma.AmountCreateManyInput[] {
        return [
            {
                transactionId: fromTransactionId,
                amount: fromAmount.amount,
                currency,
                action: 'EXPENSES',
                financialAccountId: fromAmount.financialAccountId
            },
            {
                transactionId: toTransactionId,
                amount: toAmount.amount,
                currency,
                action: 'INCOME',
                financialAccountId: toAmount.financialAccountId
            }
        ]
    }

    /**
     * Merges TRANSFER transactions that share the same transferId into a single transaction object.
     * The merged transaction will contain both amounts (INCOME and EXPENSES).
     */
    mergeTransferTransactions<
        T extends { action: TransactionActionEnum; transferId: string | null; amounts: unknown[] }
    >(transactions: T[]): T[] {
        const transferMap = new Map<string, T>()
        const result: T[] = []

        for (const transaction of transactions) {
            // If it's not a TRANSFER or has no transferId, add it as-is
            if (transaction.action !== 'TRANSFER' || !transaction.transferId) {
                result.push(transaction)
                continue
            }

            const transferId = transaction.transferId

            // Check if we already have a transaction with this transferId
            if (transferMap.has(transferId)) {
                // Merge amounts into the existing transaction
                const existing = transferMap.get(transferId)!
                existing.amounts.push(...transaction.amounts)
            } else {
                // First time seeing this transferId, store it
                transferMap.set(transferId, { ...transaction })
            }
        }

        // Add all merged transfer transactions to the result
        result.push(...Array.from(transferMap.values()))

        return result
    }

    /**
     * Replaces amounts for a transaction and updates the affected account
     * balances. If `originalAmounts` is provided the old values are reverted
     * before the new ones are applied.
     */
    private async persistAmounts(
        tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
        transactionId: string,
        amountsData: Prisma.AmountCreateManyInput[],
        originalAmounts?: { transactionId: string; amount: unknown }[]
    ) {
        if (originalAmounts) {
            await tx.amount.deleteMany({ where: { transactionId } })
        }
        await tx.amount.createMany({ data: amountsData })

        const originalMap = originalAmounts
            ? new Map(originalAmounts.map(a => [a.transactionId, Number(a.amount)]))
            : undefined

        await BalanceHelper.updateAccountBalances(amountsData as unknown as Amount[], originalMap, tx)
    }

    private normalize(
        data: CreateTransactionRequest | UpdateTransactionRequest
    ): Partial<Omit<Prisma.TransactionCreateManyInput, 'userId'>> {
        const { title, action, date, note, ignore, categoryId, subcategoryId } = data
        return {
            title,
            action,
            ...(date !== undefined && { date: new Date(date).toISOString() }),
            note,
            ignore,
            ...(action === 'TRANSFER' ? { categoryId: null, subcategoryId: null } : { categoryId, subcategoryId })
        }
    }

    /**
     * Uploads files via BaseService.saveFile and persists a TransactionMedia
     * row for each upload. No-op if no files are provided.
     */
    async saveTransactionMedia(transactionId: string, files?: Express.Multer.File[]) {
        if (!files || files.length === 0) return

        const mediaData = await Promise.all(
            files.map(async file => {
                const path = await this.saveFile(transactionId, file)
                return {
                    transactionId,
                    filename: file.originalname,
                    filetype: file.mimetype,
                    path
                }
            })
        )

        await prisma.transactionMedia.createMany({ data: mediaData })
    }

    // ------------------------------------------------------------------ //
    // READ / DELETE
    // ------------------------------------------------------------------ //

    private async fetchTransferTransactionByTransferId(transferId: string) {
        const transfer = await prisma.transfer.findUnique({
            where: { id: transferId },
            include: {
                fromTransaction: { include: { amounts: true, media: true } },
                toTransaction: { include: { amounts: true, media: true } }
            }
        })

        if (!transfer || !transfer.fromTransaction || !transfer.toTransaction) {
            throw new Error(`Transfer not found for id ${transferId}`)
        }

        const mapAmount = (a: any) => ({
            ...a,
            amount: a.amount.toNumber(),
            importReference: a.importReference || undefined,
            createdAt: a.createdAt.toISOString()
        })

        return {
            id: transferId,
            date: transfer.transferDate.toISOString(),
            note: transfer.note,
            userId: transfer.userId,
            amounts: [
                ...transfer.fromTransaction.amounts.map(mapAmount),
                ...transfer.toTransaction.amounts.map(mapAmount)
            ],
            media: [...transfer.fromTransaction.media, ...transfer.toTransaction.media],
            transferId: transfer.id,
            title: transfer.fromTransaction.title,
            action: 'TRANSFER',
            createdAt: transfer.transferDate.toISOString(),
            updatedAt: transfer.transferDate.toISOString(),
            status: 'APPROVED',
            ignore: false
        }
    }

    /**
     * Deletes a transaction by ID. If the transaction is part of a transfer, both sides of the transfer are deleted.
     * @param id transaction ID
     */
    async deleteTransaction(id: string): Promise<void> {
        const userId = this.getUserId()
        await prisma.transaction.delete({
            where: { id, userId }
        })
    }

    /**
     * Deletes all transactions for the user. Use with caution. This is used when deleting a financial account, to delete all transactions linked to that account.
     */
    async deleteAllTransactions(): Promise<void> {
        const userId = this.getUserId()
        await prisma.transaction.deleteMany({
            where: { userId }
        })
    }

    /**
     * Fetches a transaction by ID. If it's part of a transfer, the full transfer details are included.
     * @param id transaction ID
     * @returns transaction details with amounts and media, or transfer details if it's a transfer transaction
     */
    async getTransactionById(id: string): Promise<TransactionData> {
        const userId = this.getUserId()

        const transaction = await prisma.transaction.findFirst({
            where: { id, userId },
            omit: { userId: true, deletedAt: true },
            include: { amounts: true, media: true }
        })

        if (!transaction) {
            throw new Error(`Transaction with id ${id} not found`)
        }

        return transaction as unknown as TransactionData
    }

    /**
     * Fetches a transaction by ID. If it's part of a transfer, the full transfer details are included.
     * @param query filters and options for fetching transactions, including pagination and sorting
     * @returns a paginated list of transactions matching the filters, with total count for pagination
     */
    async getTransactions(query: QueryTransactionFilters) {
        const userId = this.getUserId()

        const filter = (query.filter ?? {}) as TransactionFilters
        const options = (query.options ?? {}) as FilterOptions

        const parsedSkip = Number(options.skip)
        const parsedTake = Number(options.take)
        const skip = Number.isNaN(parsedSkip) ? 0 : parsedSkip
        const take = Number.isNaN(parsedTake) ? undefined : parsedTake
        const sortBy = options.sortBy ?? 'date'
        const sortOrder: Prisma.SortOrder = options.sortOrder ?? 'desc'

        const { financialAccountId, ...baseFilter } = filter
        const wherePayload: Record<string, unknown> = {
            ...baseFilter,
            userId,
            status: 'APPROVED'
        }

        if (financialAccountId) {
            wherePayload.amounts = {
                some: { financialAccountId }
            }
        }

        const where = buildWhere(wherePayload, [])

        const mustSortByAmount = sortBy === 'amount'
        const stableOrder: Prisma.TransactionOrderByWithRelationInput[] = [{ date: 'desc' }, { id: 'desc' }]
        const relationalOrderMap: Record<string, Prisma.TransactionOrderByWithRelationInput> = {
            category: { category: { title: sortOrder } },
            subcategory: { subcategory: { title: sortOrder } }
        }

        const orderBy: Prisma.TransactionOrderByWithRelationInput[] = mustSortByAmount
            ? stableOrder
            : [
                  relationalOrderMap[sortBy] ?? ({ [sortBy]: sortOrder } as Prisma.TransactionOrderByWithRelationInput),
                  { createdAt: sortOrder },
                  { id: sortOrder }
              ]

        const list = await prisma.transaction.findMany({
            where,
            include: { amounts: true, media: true },
            omit: { userId: true, deletedAt: true },
            orderBy,
            skip: mustSortByAmount ? 0 : skip,
            ...(mustSortByAmount || !take || take <= 0 ? {} : { take })
        })
        const total = await prisma.transaction.count({ where })

        let transactions = list
        if (mustSortByAmount) {
            transactions = [...transactions].sort((left, right) => {
                const leftAmount = Number(left.amounts[0]?.amount ?? 0)
                const rightAmount = Number(right.amounts[0]?.amount ?? 0)
                return sortOrder === 'asc' ? leftAmount - rightAmount : rightAmount - leftAmount
            })

            const end = take && take > 0 ? skip + take : undefined
            transactions = transactions.slice(skip, end)
        }

        return {
            data: this.mergeTransferTransactions(transactions) as unknown as TransactionData[],
            total
        }
    }
}
