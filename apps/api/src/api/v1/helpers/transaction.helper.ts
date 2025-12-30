import prisma from '@poveroh/prisma'
import { Prisma } from '@prisma/client'
import moment from 'moment-timezone'
import {
    Currencies,
    ExpensesFormData,
    FormMode,
    IAmount,
    IAmountBase,
    IncomeFormData,
    ITransaction,
    ITransactionBase,
    TransactionAction,
    TransactionStatus,
    TransferFormData
} from '@poveroh/types'
import { BalanceHelper } from './balance.helper'
import { TransactionWithAmounts } from '@/types/transactions'

/**
 * Transaction Helper - Handles all transaction operations including creation and updating of transactions
 */
export const TransactionHelper = {
    /**
     * Main entry point for handling all transaction operations
     * @param action - The transaction action type (TRANSFER, INCOME, EXPENSES)
     * @param data - The form data containing transaction details
     * @param userId - The ID of the user creating/updating the transaction
     * @param transactionId - Optional ID for updating existing transactions
     * @returns Promise resolving to the created/updated transaction with amounts
     */
    async handleTransaction(action: string, data: FormMode, userId: string, transactionId?: string) {
        // Validate inputs
        this.validateTransactionAction(action)
        this.validateTransactionData(data, action as TransactionAction)

        if (!userId) {
            throw new Error('User ID is required')
        }

        switch (action) {
            case TransactionAction.TRANSFER:
                return this.handleTransferTransaction(data as TransferFormData, userId, transactionId)
            case TransactionAction.INCOME:
                return this.handleIncomeTransaction(data as IncomeFormData, userId, transactionId)
            case TransactionAction.EXPENSES:
                return this.handleExpensesTransaction(data as ExpensesFormData, userId, transactionId)
            default:
                throw new Error(`Invalid transaction action: ${action}`)
        }
    },

    validateTransactionAction(action: string): void {
        const validActions = Object.values(TransactionAction)
        if (!validActions.includes(action as TransactionAction)) {
            throw new Error(`Invalid transaction action: ${action}. Valid actions are: ${validActions.join(', ')}`)
        }
    },

    validateTransactionData(data: FormMode, action: TransactionAction): void {
        if (!data.title || data.title.trim().length === 0) {
            throw new Error('Transaction title is required')
        }

        if (!data.date) {
            throw new Error('Transaction date is required')
        }

        // Validate date format
        const date = new Date(data.date)
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date format')
        }

        // Action-specific validation
        switch (action) {
            case TransactionAction.TRANSFER:
                const transferData = data as TransferFormData
                if (!transferData.from || !transferData.to) {
                    throw new Error('Both source and destination accounts are required for transfers')
                }
                if (transferData.from === transferData.to) {
                    throw new Error('Source and destination accounts cannot be the same')
                }
                if (!transferData.amount || transferData.amount <= 0) {
                    throw new Error('Transfer amount must be greater than 0')
                }
                break

            case TransactionAction.INCOME:
                const incomeData = data as IncomeFormData
                if (!incomeData.financialAccountId) {
                    throw new Error('Financial account is required for income transactions')
                }
                if (!incomeData.amount || incomeData.amount <= 0) {
                    throw new Error('Income amount must be greater than 0')
                }
                if (!incomeData.categoryId) {
                    throw new Error('Category is required for income transactions')
                }
                break

            case TransactionAction.EXPENSES:
                const expensesData = data as ExpensesFormData
                if (!expensesData.categoryId) {
                    throw new Error('Category is required for expense transactions')
                }
                if (expensesData.multipleAmount) {
                    if (!expensesData.amounts || expensesData.amounts.length === 0) {
                        throw new Error('At least one amount entry is required for multiple expense splits')
                    }
                    expensesData.amounts.forEach((amount, index) => {
                        if (!amount.amount || amount.amount <= 0) {
                            throw new Error(`Amount at position ${index + 1} must be greater than 0`)
                        }
                        if (!amount.financialAccountId) {
                            throw new Error(`Financial account at position ${index + 1} is required`)
                        }
                    })
                } else {
                    if (!expensesData.totalFinancialAccountId) {
                        throw new Error('Financial account is required for single expense transactions')
                    }
                    if (!expensesData.totalAmount || expensesData.totalAmount <= 0) {
                        throw new Error('Total amount must be greater than 0')
                    }
                }
                break
        }
    },
    async handleTransferTransaction(data: TransferFormData, userId: string, transactionId?: string) {
        // Retrieve user timezone
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { timezone: true }
        })
        if (!user) {
            throw new Error('User not found')
        }

        // Convert date to UTC
        const utcDate = moment.tz(data.date, user.timezone).utc().toISOString()

        let localTransferId = transactionId || ''

        try {
            if (transactionId) {
                // Edit flow: update transaction and replace amounts
                await prisma.$transaction(
                    async tx => {
                        const transaction = await tx.transaction.findUnique({
                            where: { id: transactionId },
                            include: { amounts: true }
                        })

                        const originalAmounts = transaction?.amounts || []

                        if (!transaction) {
                            throw new Error(`Transaction with id ${transactionId} not found`)
                        }

                        await tx.transaction.update({
                            where: { id: transactionId },
                            data: await this.normalizeTransaction(TransactionAction.TRANSFER, data, userId)
                        })

                        // Delete existing amounts and create new ones
                        await tx.amount.deleteMany({
                            where: { transactionId }
                        })

                        const amountsData = [
                            this.createAmountData({
                                transactionId: transaction.id,
                                amount: data.amount,
                                currency: data.currency,
                                action: TransactionAction.EXPENSES,
                                financialAccountId: data.from
                            }),
                            this.createAmountData({
                                transactionId: transaction.id,
                                amount: data.amount,
                                currency: data.currency,
                                action: TransactionAction.INCOME,
                                financialAccountId: data.to
                            })
                        ]

                        await tx.amount.createMany({
                            data: amountsData.map(a => ({ ...a, action: a.action as 'EXPENSES' | 'INCOME' }))
                        })

                        // If multiple amounts, update balances for each
                        const originalAmountsMap = new Map(
                            originalAmounts.map((amt, idx) => [amountsData[idx].transactionId, amt?.amount.toNumber()])
                        )
                        await BalanceHelper.updateAccountBalances(amountsData, originalAmountsMap, tx)

                        // localTransferId = transfer.id
                    },
                    { timeout: 30000 }
                )
            } else {
                const normalizedData = {
                    ...(await this.normalizeTransaction(TransactionAction.TRANSFER, data, userId)),
                    userId: userId
                }

                await prisma.$transaction(
                    async tx => {
                        // Create 2 identical transactions
                        const transactions = await tx.transaction.createManyAndReturn({
                            data: [normalizedData, normalizedData]
                        })

                        const amountsData = [
                            this.createAmountData({
                                transactionId: transactions[0].id,
                                amount: data.amount,
                                currency: data.currency,
                                action: TransactionAction.EXPENSES,
                                financialAccountId: data.from
                            }),
                            this.createAmountData({
                                transactionId: transactions[1].id,
                                amount: data.amount,
                                currency: data.currency,
                                action: TransactionAction.INCOME,
                                financialAccountId: data.to
                            })
                        ]

                        await tx.amount.createMany({
                            data: amountsData
                        })

                        // If multiple amounts, update balances for each
                        for (let i = 0; i < amountsData.length; i++) {
                            await BalanceHelper.updateAccountBalances(amountsData[i], undefined, tx)
                        }

                        const transfer = await tx.transfer.create({
                            data: {
                                transferDate: utcDate,
                                note: data.note,
                                fromTransactionId: transactions[0].id,
                                toTransactionId: transactions[1].id,
                                userId: userId
                            }
                        })

                        await tx.transaction.updateMany({
                            where: { id: { in: [transactions[0].id, transactions[1].id] } },
                            data: {
                                transferId: transfer.id
                            }
                        })

                        localTransferId = transfer.id
                    },
                    { timeout: 30000 }
                )
            }

            return await this.fetchTransferTransaction(localTransferId)
        } catch (error) {
            throw new Error(
                `Failed to handle internal transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    },
    async handleIncomeTransaction(data: IncomeFormData, userId: string, transactionId?: string) {
        let localTransactionId = transactionId || ''

        try {
            if (transactionId) {
                // Edit flow: update transaction and replace the single amount
                await prisma.$transaction(
                    async tx => {
                        const existingTransaction = await tx.transaction.findUnique({
                            where: { id: transactionId },
                            include: { amounts: true }
                        })

                        if (!existingTransaction) {
                            throw new Error(`Transaction with id ${transactionId} not found`)
                        }

                        if (!existingTransaction.amounts || existingTransaction.amounts.length === 0) {
                            throw new Error(`No amounts found for transaction with id ${transactionId}`)
                        }

                        await tx.transaction.update({
                            where: {
                                id: transactionId,
                                userId: userId
                            },
                            data: await this.normalizeTransaction(TransactionAction.INCOME, data, userId)
                        })

                        const amountData = this.createAmountData({
                            transactionId,
                            amount: data.amount,
                            currency: data.currency,
                            action: TransactionAction.INCOME,
                            financialAccountId: data.financialAccountId
                        })

                        await tx.amount.update({
                            where: { id: existingTransaction.amounts[0].id },
                            data: { ...amountData, action: amountData.action as 'EXPENSES' | 'INCOME' }
                        })

                        const originalAmountsMap = new Map([
                            [amountData.transactionId, existingTransaction.amounts[0].amount.toNumber()]
                        ])
                        await BalanceHelper.updateAccountBalances(amountData, originalAmountsMap, tx)

                        localTransactionId = transactionId
                    },
                    { timeout: 30000 }
                )
            } else {
                // Create flow: create new transaction and amount
                const normalizedData = await this.normalizeTransaction(TransactionAction.INCOME, data, userId)
                await prisma.$transaction(
                    async tx => {
                        const transaction = await tx.transaction.create({
                            data: {
                                ...normalizedData,
                                userId: userId
                            }
                        })

                        const amountData = this.createAmountData({
                            transactionId: transaction.id,
                            amount: data.amount,
                            currency: data.currency,
                            action: TransactionAction.INCOME,
                            financialAccountId: data.financialAccountId
                        })

                        await tx.amount.create({
                            data: { ...amountData, action: amountData.action as 'EXPENSES' | 'INCOME' }
                        })

                        await BalanceHelper.updateAccountBalances(amountData, undefined, tx)

                        localTransactionId = transaction.id
                    },
                    { timeout: 30000 }
                )
            }

            return await this.fetchTransactionWithAmounts(localTransactionId)
        } catch (error) {
            throw new Error(
                `Failed to handle income transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    },
    async handleExpensesTransaction(data: ExpensesFormData, userId: string, transactionId?: string) {
        try {
            let resultTransactionId: string

            if (transactionId) {
                // Edit flow: update transaction and replace the single amount
                await prisma.$transaction(
                    async tx => {
                        const existingTransaction = await tx.transaction.findUnique({
                            where: { id: transactionId },
                            include: { amounts: true }
                        })

                        if (!existingTransaction) {
                            throw new Error(`Transaction with id ${transactionId} not found`)
                        }

                        if (!existingTransaction.amounts || existingTransaction.amounts.length === 0) {
                            throw new Error(`No amounts found for transaction with id ${transactionId}`)
                        }

                        // Edit flow: update transaction and replace amounts
                        const transaction = await tx.transaction.update({
                            where: { id: transactionId },
                            data: await this.normalizeTransaction(TransactionAction.EXPENSES, data, userId)
                        })

                        // Delete existing amounts
                        await tx.amount.deleteMany({
                            where: { transactionId: transaction.id }
                        })

                        // Create new amounts
                        const amountsData = this.buildExpensesAmounts(transaction.id, data)
                        if (amountsData.length > 0) {
                            await tx.amount.createMany({
                                data: amountsData.map(a => ({ ...a, action: a.action as 'EXPENSES' | 'INCOME' }))
                            })
                        }

                        // If multiple amounts, update balances for each
                        const originalAmountsMap = new Map(
                            existingTransaction.amounts.map((amt, idx) => [
                                amountsData[idx]?.transactionId,
                                amt?.amount.toNumber()
                            ])
                        )
                        await BalanceHelper.updateAccountBalances(amountsData, originalAmountsMap, tx)

                        resultTransactionId = transaction.id
                    },
                    { timeout: 30000 }
                )
            } else {
                // Create flow: create new transaction and amounts
                const normalizedData = await this.normalizeTransaction(TransactionAction.EXPENSES, data, userId)
                await prisma.$transaction(
                    async tx => {
                        const transaction = await tx.transaction.create({
                            data: {
                                ...normalizedData,
                                userId: userId
                            }
                        })

                        const amountsData = this.buildExpensesAmounts(transaction.id, data)
                        if (amountsData.length > 0) {
                            await tx.amount.createMany({
                                data: amountsData.map(a => ({ ...a, action: a.action as 'EXPENSES' | 'INCOME' }))
                            })
                        }

                        // If multiple amounts, update balances for each
                        for (let i = 0; i < amountsData.length; i++) {
                            await BalanceHelper.updateAccountBalances(amountsData[i], undefined, tx)
                        }

                        resultTransactionId = transaction.id
                    },
                    { timeout: 30000 }
                )
            }

            return await this.fetchTransactionWithAmounts(resultTransactionId!)
        } catch (error) {
            throw new Error(
                `Failed to handle expenses transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    },

    buildExpensesAmounts(transactionId: string, data: ExpensesFormData): IAmountBase[] {
        const amountsData: IAmountBase[] = []

        // Handle multiple amounts from split expenses
        if (data.amounts && data.amounts.length > 0) {
            data.amounts.forEach((element: any) => {
                amountsData.push(
                    this.createAmountData({
                        transactionId,
                        amount: element.amount,
                        currency: data.currency,
                        action: TransactionAction.EXPENSES,
                        financialAccountId: element.financialAccountId
                    })
                )
            })
        }

        // Handle single total amount (non-multiple split)
        if (!data.multipleAmount && data.totalFinancialAccountId) {
            amountsData.push(
                this.createAmountData({
                    transactionId,
                    amount: data.totalAmount,
                    currency: data.currency,
                    action: TransactionAction.EXPENSES,
                    financialAccountId: data.totalFinancialAccountId
                })
            )
        }

        if (amountsData.length === 0) {
            throw new Error('No valid amounts provided for expenses transaction')
        }

        return amountsData
    },

    async fetchTransactionWithAmounts(transactionId: string) {
        if (!transactionId) {
            throw new Error('Transaction ID is required')
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { amounts: true }
        })

        if (!transaction) {
            throw new Error(`Transaction with id ${transactionId} not found`)
        }

        return transaction
    },

    async fetchTransferTransaction(transferId: string) {
        if (!transferId) {
            throw new Error('Transfer ID is required')
        }

        const transfer = await prisma.transfer.findUnique({
            where: { id: transferId },
            include: {
                fromTransaction: { include: { amounts: true } },
                toTransaction: { include: { amounts: true } }
            }
        })

        if (!transfer) {
            throw new Error(`Transfer with id ${transferId} not found`)
        }

        if (!transfer.fromTransaction || !transfer.toTransaction) {
            throw new Error(`Transfer transactions not found for transfer id ${transferId}`)
        }

        const transaction: ITransaction = {
            id: transferId,
            date: transfer.transferDate.toISOString(),
            note: transfer.note,
            userId: transfer.userId,
            amounts: [
                ...transfer.fromTransaction.amounts.map(a => ({
                    ...a,
                    amount: a.amount.toNumber(),
                    currency: a.currency as Currencies,
                    action: a.action as TransactionAction,
                    importReference: a.importReference || undefined,
                    createdAt: a.createdAt.toISOString()
                })),
                ...transfer.toTransaction.amounts.map(a => ({
                    ...a,
                    amount: a.amount.toNumber(),
                    currency: a.currency as Currencies,
                    action: a.action as TransactionAction,
                    importReference: a.importReference || undefined,
                    createdAt: a.createdAt.toISOString()
                }))
            ],
            transferId: transfer.id,
            title: transfer.fromTransaction.title,
            action: TransactionAction.TRANSFER,
            createdAt: transfer.transferDate.toISOString(),
            updatedAt: transfer.transferDate.toISOString(),
            status: TransactionStatus.APPROVED,
            ignore: false
        }

        return transaction
    },

    async normalizeTransaction(
        action: TransactionAction,
        transaction: FormMode,
        userId: string
    ): Promise<ITransactionBase> {
        // Retrieve user timezone
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { timezone: true }
        })
        if (!user) {
            throw new Error('User not found')
        }

        // Convert date to UTC ISO 8601 based on user's timezone
        const utcDate = moment.tz(transaction.date, user.timezone).utc().toISOString()

        const baseData: ITransactionBase = {
            title: transaction.title,
            action: action,
            date: utcDate,
            note: transaction.note,
            ignore: transaction.ignore || false,
            categoryId: undefined,
            subcategoryId: undefined
        }

        switch (action) {
            case TransactionAction.TRANSFER:
                return baseData
            case TransactionAction.INCOME:
            case TransactionAction.EXPENSES:
                const categoryData = transaction as IncomeFormData | ExpensesFormData
                return {
                    ...baseData,
                    categoryId: categoryData.categoryId,
                    subcategoryId: categoryData.subcategoryId
                }
            default:
                throw new Error(`Invalid transaction action: ${action}`)
        }
    },
    /**
     * Creates or converts an Amount object to IAmountBase
     */
    createAmountData(
        params:
            | { dbAmount: Prisma.AmountGetPayload<{}> }
            | {
                  transactionId: string
                  amount: number
                  currency: string
                  action: TransactionAction
                  financialAccountId: string
              }
    ): IAmountBase {
        // If dbAmount is provided, convert from DB object
        if ('dbAmount' in params) {
            const dbAmount = params.dbAmount
            return {
                transactionId: dbAmount.transactionId,
                amount: typeof dbAmount.amount === 'number' ? dbAmount.amount : dbAmount.amount.toNumber(),
                currency: dbAmount.currency as Currencies,
                action: dbAmount.action as TransactionAction,
                financialAccountId: dbAmount.financialAccountId
            }
        }

        // Otherwise, create from individual parameters
        const { transactionId, amount, currency, action, financialAccountId } = params
        if (!transactionId || !financialAccountId) {
            throw new Error('Transaction ID and financial account ID are required')
        }
        if (!amount || amount <= 0) {
            throw new Error('Amount must be greater than 0')
        }

        return {
            transactionId,
            amount,
            currency: currency as Currencies,
            action,
            financialAccountId
        }
    },
    /**
     * Merges TRANSFER transactions that share the same transferId into a single transaction object.
     * The merged transaction will contain both amounts (INCOME and EXPENSES).
     */
    mergeTransferTransactions(transactions: TransactionWithAmounts[]): TransactionWithAmounts[] {
        const transferMap = new Map<string, TransactionWithAmounts>()
        const result: TransactionWithAmounts[] = []

        for (const transaction of transactions) {
            // If it's not a TRANSFER or has no transferId, add it as-is
            if (transaction.action !== TransactionAction.TRANSFER || !transaction.transferId) {
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
}
