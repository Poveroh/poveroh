import prisma, { Prisma } from '@poveroh/prisma'
import moment from 'moment-timezone'
import type {
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
    TransactionListData,
    UpdateTransactionRequest
} from '@poveroh/types'
import { BadRequestError, NotFoundError } from '@/utils'
import { getJobDispatcher } from '@/utils/queue'
import { AccountBalanceService } from '../financial-accounts/account-balance/account-balance.service'
import { BaseService } from '../base/base.service'
import { CreateTransactionRequestSchema, UpdateTransactionRequestSchema } from '@poveroh/schemas'
import { TransactionRepository } from './transaction.repository'
import { eventBus } from '@/v1/worker/events/event-bus'

/**
 * Service for managing transactions (create, update, delete, read).
 * `CreateUpdateTransactionRequest` is a union of create (all fields required)
 * and update (all optional). The presence of `transactionId` selects the branch.
 */
export class TransactionService extends BaseService {
    private readonly transactionRepository = new TransactionRepository()
    private readonly accountBalanceService = new AccountBalanceService()

    constructor() {
        super('transaction')
    }

    /**
     * Dispatches an incoming transaction payload to the correct create or update branch based on the supplied transaction id and resolved action.
     * @param payload The transaction payload, optionally including an id when the caller is updating an existing transaction.
     * @param files The list of files uploaded alongside the request to be persisted as transaction media.
     * @param transactionId The unique identifier of the transaction to be updated when the caller is updating.
     * @returns A promise that resolves to the resulting transaction data.
     */
    async handleTransaction(
        payload: CreateUpdateTransactionRequest,
        files?: Express.Multer.File[],
        transactionId?: string
    ) {
        const userId = this.context.currentUser.id

        if (transactionId) {
            const parsed = UpdateTransactionRequestSchema.parse(payload) as UpdateTransactionRequest
            const updated = await this.updateTransaction(transactionId, parsed, userId, files)
            await eventBus.emit('transaction.updated', { userId, data: updated as unknown as TransactionData })
            return updated
        }

        const parsed = CreateTransactionRequestSchema.parse(payload) as CreateTransactionRequest
        let created
        switch (parsed.action) {
            case 'TRANSFER':
                created = await this.createTransfer(parsed, userId, files)
                break
            case 'INCOME':
            case 'EXPENSES':
                created = await this.createStandard(parsed, userId, files)
                break
            default:
                throw new BadRequestError(`Invalid transaction action: ${parsed.action}`)
        }

        await eventBus.emit('transaction.created', { userId, data: created as unknown as TransactionData })
        return created
    }

    /**
     * Creates a standard INCOME or EXPENSES transaction along with its amounts and persists any uploaded files as transaction media.
     * @param payload The create payload for the transaction.
     * @param userId The ID of the user who owns the transaction being created.
     * @param files The list of files uploaded alongside the request to be persisted as transaction media.
     * @returns A promise that resolves to the newly created transaction enriched with amounts and media.
     */
    private async createStandard(payload: CreateTransactionRequest, userId: string, files?: Express.Multer.File[]) {
        const normalized = this.normalize(payload) as Prisma.TransactionCreateManyInput
        let resultId = ''
        let affectedAccountIds: string[] = []

        await prisma.$transaction(
            async tx => {
                const transaction = await this.transactionRepository.create(tx, { ...normalized, userId })

                const amountsData = this.buildAmounts(transaction.id, payload.amounts, payload.currency)
                await this.persistAmounts(tx, transaction.id, amountsData)

                resultId = transaction.id
                affectedAccountIds = amountsData.map(a => a.financialAccountId)
            },
            { timeout: 30000 }
        )

        // Rebuild the daily balance series of each touched account from the transaction date forward so a
        // backdated transaction fills in the missing daily points. Runs after commit to read the persisted amounts.
        await this.backfillBalanceSeries(affectedAccountIds, userId, new Date(payload.date))

        await this.saveTransactionMedia(resultId, files)
        return this.getTransactionById(resultId)
    }

    /**
     * Creates a transfer between two financial accounts as two linked transactions, updating balances and persisting any uploaded files as transaction media on both sides.
     * @param payload The create payload for the transfer.
     * @param userId The ID of the user who owns the transfer being created.
     * @param files The list of files uploaded alongside the request to be persisted as transaction media.
     * @returns A promise that resolves to the merged transfer transaction data.
     */
    private async createTransfer(payload: CreateTransactionRequest, userId: string, files?: Express.Multer.File[]) {
        const { fromAmount, toAmount } = this.splitTransferAmounts(payload.amounts)
        const utcDate = this.resolveUtcDate(payload.date)
        const normalized = { ...this.normalize(payload), userId } as Prisma.TransactionCreateManyInput
        let transferId = ''
        let transactionIds: string[] = []
        let affectedAccountIds: string[] = []

        await prisma.$transaction(
            async tx => {
                const transactions = await this.transactionRepository.createManyAndReturn(tx, [normalized, normalized])

                const amountsData = this.buildTransferAmounts(
                    transactions[0].id,
                    transactions[1].id,
                    fromAmount,
                    toAmount,
                    payload.currency
                )
                await this.transactionRepository.createAmounts(tx, amountsData)
                await this.accountBalanceService.applyAmounts(amountsData as unknown as Amount[], undefined, tx)

                affectedAccountIds = amountsData.map(a => a.financialAccountId)

                const transfer = await this.transactionRepository.createTransfer(tx, {
                    transferDate: utcDate,
                    note: payload.note,
                    fromTransactionId: transactions[0].id,
                    toTransactionId: transactions[1].id,
                    userId
                })

                await this.transactionRepository.linkTransfer(tx, [transactions[0].id, transactions[1].id], transfer.id)

                transferId = transfer.id
                transactionIds = [transactions[0].id, transactions[1].id]
            },
            { timeout: 30000 }
        )

        // // Backfill the daily series of both ends of the transfer from the transfer date forward, after commit.
        // await this.backfillBalanceSeries(affectedAccountIds, userId, new Date(payload.date))

        await Promise.all(transactionIds.map(id => this.saveTransactionMedia(id, files)))
        return this.fetchTransferTransactionByTransferId(transferId)
    }

    /**
     * Enqueues a background job per distinct affected account to rebuild its daily balance series from a date forward, used after a transaction is created so a backdated transaction fills in the missing daily points without blocking the request. The job is idempotent, so a transient failure can be retried safely.
     * @param financialAccountIds The financial accounts touched by the transaction; duplicates are ignored.
     * @param userId The ID of the user who owns the affected accounts.
     * @param fromDate The earliest date impacted by the transaction.
     * @returns A promise that resolves once the backfill jobs have been enqueued.
     */
    private async backfillBalanceSeries(financialAccountIds: string[], userId: string, fromDate: Date): Promise<void> {
        const fromDateIso = fromDate.toISOString()
        const dispatcher = getJobDispatcher()

        await Promise.all(
            Array.from(new Set(financialAccountIds)).map(financialAccountId =>
                dispatcher.dispatch(
                    'account-balance.backfill-range',
                    { userId, financialAccountId, fromDate: fromDateIso },
                    { attempts: 3, backoff: { type: 'exponential', delay: 1000 } }
                )
            )
        )
    }

    /**
     * Updates an existing transaction, applying any changes to its amounts and balances and persisting any uploaded files as transaction media.
     * @param transactionId The unique identifier of the transaction being updated.
     * @param payload The update payload to be applied.
     * @param userId The ID of the user who owns the transaction being updated.
     * @param files The list of files uploaded alongside the request to be persisted as transaction media.
     * @returns A promise that resolves to the updated transaction or the merged transfer transaction when the update targets a transfer.
     */
    private async updateTransaction(
        transactionId: string,
        payload: UpdateTransactionRequest,
        userId: string,
        files?: Express.Multer.File[]
    ) {
        const existing = await this.transactionRepository.findByIdWithAmounts(prisma, userId, transactionId)

        if (!existing) {
            throw new NotFoundError(`Transaction with id ${transactionId} not found`)
        }

        const effectiveAction = (payload.action ?? existing.action) as TransactionActionEnum
        const updateData = this.normalize(payload)
        const hasAmounts = Array.isArray(payload.amounts) && payload.amounts.length > 0
        const currency = (payload.currency ?? existing.amounts[0]?.currency) as CurrencyEnum

        const amountsData = hasAmounts
            ? effectiveAction === 'TRANSFER'
                ? (() => {
                      const { fromAmount, toAmount } = this.splitTransferAmounts(payload.amounts!)
                      return this.buildTransferAmounts(transactionId, transactionId, fromAmount, toAmount, currency)
                  })()
                : this.buildAmounts(transactionId, payload.amounts!, currency)
            : undefined

        await prisma.$transaction(
            async tx => {
                if (Object.keys(updateData).length > 0) {
                    await this.transactionRepository.update(tx, userId, transactionId, updateData)
                }

                if (!amountsData) return

                await this.persistAmounts(tx, transactionId, amountsData, existing.amounts as unknown as Amount[])
            },
            { timeout: 30000 }
        )

        // A retroactive change to amounts, type, account or date invalidates the materialized balance series and
        // the snapshots from the earliest affected day forward, for every account on either the old or new side.
        const newDate = payload.date ? new Date(payload.date) : existing.date
        const dateChanged = payload.date !== undefined && newDate.getTime() !== existing.date.getTime()
        if (hasAmounts || dateChanged) {
            const affectedAccountIds = new Set<string>([
                ...existing.amounts.map(a => a.financialAccountId),
                ...(amountsData?.map(a => a.financialAccountId) ?? [])
            ])
            const fromDate = newDate.getTime() < existing.date.getTime() ? newDate : existing.date

            await Promise.all(
                Array.from(affectedAccountIds).map(accountId =>
                    this.accountBalanceService.recomputeFromTransactionChange(accountId, userId, fromDate)
                )
            )
        }

        await this.saveTransactionMedia(transactionId, files)

        if (existing.transferId) {
            return this.fetchTransferTransactionByTransferId(existing.transferId)
        }
        return this.getTransactionById(transactionId)
    }

    /**
     * Splits a transfer amounts payload into its outgoing (EXPENSES) and incoming (INCOME) sides.
     * @param amounts The list of amounts attached to a transfer payload.
     * @returns An object exposing the from (EXPENSES) and to (INCOME) amounts of the transfer.
     */
    private splitTransferAmounts(amounts: TransactionAmount[]) {
        const fromAmount = amounts.find(a => a.action === 'EXPENSES')!
        const toAmount = amounts.find(a => a.action === 'INCOME')!
        return { fromAmount, toAmount }
    }

    /**
     * Converts the supplied local date to its UTC ISO representation using the timezone of the authenticated user from the active request context.
     * @param date The local date to be converted.
     * @returns The UTC ISO date string of the supplied local date in the user's timezone.
     */
    private resolveUtcDate(date: string): string {
        const { timezone } = this.context.currentUser.preferences
        return moment.tz(date, timezone).utc().toISOString()
    }

    /**
     * Builds the amount rows associated with a standard transaction using the supplied amounts payload and currency.
     * @param transactionId The unique identifier of the transaction the amounts belong to.
     * @param amounts The amounts payload supplied with the transaction.
     * @param currency The currency to apply to the amounts.
     * @returns The list of amount rows ready to be persisted.
     */
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

    /**
     * Builds the two amount rows associated with a transfer (one EXPENSES, one INCOME) linked to the supplied source and destination transactions.
     * @param fromTransactionId The unique identifier of the source transaction of the transfer.
     * @param toTransactionId The unique identifier of the destination transaction of the transfer.
     * @param fromAmount The outgoing side of the transfer payload.
     * @param toAmount The incoming side of the transfer payload.
     * @param currency The currency to apply to the amounts.
     * @returns The list of amount rows ready to be persisted.
     */
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
     * Merges TRANSFER transactions that share the same transferId into a single transaction object so the consumer sees one row per transfer with both amounts.
     * @param transactions The list of transactions to merge.
     * @returns The list of transactions where transfer pairs have been combined.
     */
    mergeTransferTransactions<
        T extends { action: TransactionActionEnum; transferId: string | null; amounts: unknown[] }
    >(transactions: T[]): T[] {
        const transferMap = new Map<string, T>()
        const result: T[] = []

        for (const transaction of transactions) {
            if (transaction.action !== 'TRANSFER' || !transaction.transferId) {
                result.push(transaction)
                continue
            }

            const transferId = transaction.transferId

            if (transferMap.has(transferId)) {
                const existing = transferMap.get(transferId)!
                existing.amounts.push(...transaction.amounts)
            } else {
                transferMap.set(transferId, { ...transaction })
            }
        }

        result.push(...Array.from(transferMap.values()))

        return result
    }

    /**
     * Replaces the amounts of a transaction and updates the affected financial account balances. When originalAmounts is supplied the old values are reverted before the new ones are applied.
     * @param tx The Prisma client used to run the persistence inside an active transaction.
     * @param transactionId The unique identifier of the transaction whose amounts must be replaced.
     * @param amountsData The list of new amount rows to be persisted.
     * @param originalAmounts The original amount rows used to compute the balance reversal when updating, carrying their account and action.
     * @returns A promise that resolves when the amounts have been replaced and the balances updated.
     */
    private async persistAmounts(
        tx: Prisma.TransactionClient,
        transactionId: string,
        amountsData: Prisma.AmountCreateManyInput[],
        originalAmounts?: Amount[]
    ): Promise<void> {
        if (originalAmounts) {
            await this.transactionRepository.deleteAmountsByTransactionId(tx, transactionId)
        }
        await this.transactionRepository.createAmounts(tx, amountsData)

        await this.accountBalanceService.applyAmounts(amountsData as unknown as Amount[], originalAmounts, tx)
    }

    /**
     * Normalises the create or update payload into a partial Prisma input, clearing category and subcategory when the action is TRANSFER.
     * @param data The create or update payload to normalise.
     * @returns The partial Prisma input ready to be passed to a create or update call.
     */
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
     * Uploads the supplied files via the media service and persists a transaction media row for each upload. No-op when no files are provided.
     * @param transactionId The unique identifier of the transaction the uploaded files must be attached to.
     * @param files The list of files to be uploaded.
     * @returns A promise that resolves when the transaction media rows have been created.
     */
    async saveTransactionMedia(transactionId: string, files?: Express.Multer.File[]): Promise<void> {
        if (!files || files.length === 0) return

        const mediaData = await Promise.all(
            files.map(async file => {
                const path = await this.media.saveFile(transactionId, file)
                return {
                    transactionId,
                    filename: file.originalname,
                    filetype: file.mimetype,
                    path
                }
            })
        )

        await this.transactionRepository.createTransactionMedia(mediaData)
    }

    /**
     * Reads the transfer pair referenced by the supplied transfer id and merges its two sides into the public transfer transaction DTO shape.
     * @param transferId The unique identifier of the transfer to be retrieved.
     * @returns A promise that resolves to the merged transfer transaction DTO.
     */
    private async fetchTransferTransactionByTransferId(transferId: string) {
        const transfer = await this.transactionRepository.findTransferById(transferId)

        if (!transfer || !transfer.fromTransaction || !transfer.toTransaction) {
            throw new NotFoundError(`Transfer not found for id ${transferId}`)
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
     * Deletes a transaction owned by the authenticated user.
     * @param id The unique identifier of the transaction to be deleted.
     * @returns A promise that resolves when the transaction has been deleted.
     */
    async deleteTransaction(id: string): Promise<void> {
        const userId = this.context.currentUser.id

        const data = await this.transactionRepository.findById(userId, id)
        await this.transactionRepository.delete(userId, id)

        if (data) await eventBus.emit('transaction.deleted', { userId, data })
    }

    /**
     * Deletes every transaction owned by the authenticated user.
     * @returns A promise that resolves when the transactions have been deleted.
     */
    async deleteAllTransactions(): Promise<void> {
        await this.transactionRepository.deleteAll(this.context.currentUser.id)
    }

    /**
     * Retrieves a transaction by its unique identifier for the authenticated user, including its amounts and media.
     * @param id The unique identifier of the transaction to retrieve.
     * @returns A promise that resolves to the transaction data.
     */
    async getTransactionById(id: string): Promise<TransactionData> {
        const transaction = await this.transactionRepository.findById(this.context.currentUser.id, id)
        if (!transaction) {
            throw new NotFoundError(`Transaction with id ${id} not found`)
        }
        return transaction
    }

    /**
     * Retrieves a paginated list of approved transactions for the authenticated user using the supplied query filters and sorting options, merging transfer pairs into single rows.
     * @param query The query payload including filters and pagination options.
     * @returns A promise that resolves to an object containing the list of transactions and the total count for pagination.
     */
    async getTransactions(query: QueryTransactionFilters): Promise<TransactionListData> {
        const userId = this.context.currentUser.id

        const filter = (query.filter ?? {}) as TransactionFilters
        const options = (query.options ?? {}) as FilterOptions

        const parsedSkip = Number(options.skip)
        const parsedTake = Number(options.take)
        const skip = Number.isNaN(parsedSkip) ? 0 : parsedSkip
        const take = Number.isNaN(parsedTake) ? undefined : parsedTake
        const sortBy = options.sortBy ?? 'date'
        const sortOrder: Prisma.SortOrder = options.sortOrder ?? 'desc'

        const where = this.transactionRepository.buildListWhere({
            ...filter,
            userId,
            status: 'APPROVED'
        })

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

        const effectiveSkip = mustSortByAmount ? 0 : skip
        const effectiveTake = mustSortByAmount || !take || take <= 0 ? undefined : take

        const list = await this.transactionRepository.findMany(where, orderBy, effectiveSkip, effectiveTake)
        const total = await this.transactionRepository.count(where)

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
