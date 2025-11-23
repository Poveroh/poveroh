import prisma from '@poveroh/prisma'
import {
    Currencies,
    ExpensesFormData,
    FormMode,
    IAmountBase,
    IncomeFormData,
    ITransactionBase,
    TransactionAction,
    TransferFormData
} from '@poveroh/types'
import { BalanceHelper } from './balance.helper'

/**
 * Transaction Helper - Handles all transaction operations with optimized database transactions,
 * comprehensive validation, and error handling.
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
                return this.handleInternalTransaction(data as TransferFormData, userId, transactionId)
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

    createAmountData(
        transactionId: string,
        amount: number,
        currency: string,
        action: TransactionAction,
        financialAccountId: string
    ): IAmountBase {
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

    async handleInternalTransaction(data: TransferFormData, userId: string, transactionId?: string) {
        let localTransactionId = transactionId || ''

        try {
            if (transactionId) {
                // Edit flow: update transaction and replace amounts
                const transaction = await prisma.transaction.findUnique({
                    where: { id: transactionId },
                    include: { amounts: true }
                })

                const originalAmounts = transaction?.amounts || []

                if (!transaction) {
                    throw new Error(`Transaction with id ${transactionId} not found`)
                }

                await prisma.transaction.update({
                    where: { id: transactionId },
                    data: this.normalizeTransaction(TransactionAction.TRANSFER, data)
                })

                // Delete existing amounts and create new ones
                await prisma.amount.deleteMany({
                    where: { transactionId }
                })

                const amountsData = [
                    this.createAmountData(
                        transaction.id,
                        data.amount,
                        data.currency,
                        TransactionAction.EXPENSES,
                        data.from
                    ),
                    this.createAmountData(transaction.id, data.amount, data.currency, TransactionAction.INCOME, data.to)
                ]

                await prisma.amount.createMany({
                    data: amountsData
                })

                await BalanceHelper.updateAccountBalances(amountsData[0], originalAmounts[0].amount)
                await BalanceHelper.updateAccountBalances(amountsData[1], originalAmounts[1].amount)

                localTransactionId = transaction.id
            } else {
                // Create flow: create new transaction and amounts
                const normalizedData = this.normalizeTransaction(TransactionAction.TRANSFER, data)
                const transaction = await prisma.transaction.create({
                    data: {
                        ...normalizedData,
                        action: TransactionAction.TRANSFER,
                        userId: userId
                    }
                })

                const amountsData = [
                    this.createAmountData(
                        transaction.id,
                        data.amount,
                        data.currency,
                        TransactionAction.EXPENSES,
                        data.from
                    ),
                    this.createAmountData(transaction.id, data.amount, data.currency, TransactionAction.INCOME, data.to)
                ]

                await prisma.amount.createMany({
                    data: amountsData
                })

                await BalanceHelper.updateAccountBalances(amountsData[0])
                await BalanceHelper.updateAccountBalances(amountsData[1])

                localTransactionId = transaction.id
            }

            return await this.fetchTransactionWithAmounts(localTransactionId)
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
                const existingTransaction = await prisma.transaction.findUnique({
                    where: { id: transactionId },
                    include: { amounts: true }
                })

                if (!existingTransaction) {
                    throw new Error(`Transaction with id ${transactionId} not found`)
                }

                if (!existingTransaction.amounts || existingTransaction.amounts.length === 0) {
                    throw new Error(`No amounts found for transaction with id ${transactionId}`)
                }

                await prisma.transaction.update({
                    where: {
                        id: transactionId,
                        userId: userId
                    },
                    data: this.normalizeTransaction(TransactionAction.INCOME, data)
                })

                await prisma.amount.update({
                    where: { id: existingTransaction.amounts[0].id },
                    data: {
                        amount: data.amount,
                        currency: data.currency as Currencies,
                        action: TransactionAction.INCOME,
                        financialAccountId: data.financialAccountId
                    }
                })

                await BalanceHelper.updateAccountBalances(
                    {
                        transactionId: transactionId,
                        amount: data.amount,
                        currency: data.currency as Currencies,
                        action: TransactionAction.INCOME,
                        financialAccountId: data.financialAccountId
                    },
                    existingTransaction.amounts[0].amount
                )

                localTransactionId = transactionId
            } else {
                // Create flow: create new transaction and amount
                const normalizedData = this.normalizeTransaction(TransactionAction.INCOME, data)
                const transaction = await prisma.transaction.create({
                    data: {
                        ...normalizedData,
                        action: TransactionAction.INCOME,
                        userId: userId
                    }
                })

                const amountData = this.createAmountData(
                    transaction.id,
                    data.amount,
                    data.currency as Currencies,
                    TransactionAction.INCOME,
                    data.financialAccountId
                )

                await prisma.amount.create({
                    data: amountData
                })

                await BalanceHelper.updateAccountBalances(amountData)

                localTransactionId = transaction.id
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
                const existingTransaction = await prisma.transaction.findUnique({
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
                const transaction = await prisma.transaction.update({
                    where: { id: transactionId },
                    data: this.normalizeTransaction(TransactionAction.EXPENSES, data)
                })

                // Delete existing amounts
                await prisma.amount.deleteMany({
                    where: { transactionId: transaction.id }
                })

                // Create new amounts
                const amountsData = this.buildExpensesAmounts(transaction.id, data)
                if (amountsData.length > 0) {
                    await prisma.amount.createMany({
                        data: amountsData
                    })
                }

                // If multiple amounts, update balances for each
                for (let i = 1; i < amountsData.length; i++) {
                    await BalanceHelper.updateAccountBalances(amountsData[i], existingTransaction.amounts[i].amount)
                }

                resultTransactionId = transaction.id
            } else {
                // Create flow: create new transaction and amounts
                const normalizedData = this.normalizeTransaction(TransactionAction.EXPENSES, data)
                const transaction = await prisma.transaction.create({
                    data: {
                        ...normalizedData,
                        action: TransactionAction.EXPENSES,
                        userId: userId
                    }
                })

                const amountsData = this.buildExpensesAmounts(transaction.id, data)
                if (amountsData.length > 0) {
                    await prisma.amount.createMany({
                        data: amountsData
                    })
                }

                // If multiple amounts, update balances for each
                for (let i = 1; i < amountsData.length; i++) {
                    await BalanceHelper.updateAccountBalances(amountsData[i])
                }

                resultTransactionId = transaction.id
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
                    this.createAmountData(
                        transactionId,
                        element.amount,
                        data.currency,
                        TransactionAction.EXPENSES,
                        element.financialAccountId
                    )
                )
            })
        }

        // Handle single total amount (non-multiple split)
        if (!data.multipleAmount && data.totalFinancialAccountId) {
            amountsData.push(
                this.createAmountData(
                    transactionId,
                    data.totalAmount,
                    data.currency,
                    TransactionAction.EXPENSES,
                    data.totalFinancialAccountId
                )
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
    /**
     * Normalizes transaction form data into a standardized ITransactionBase structure
     * This function ensures consistent data transformation for both create and update operations
     * @param action - The transaction action type
     * @param transaction - The form data to normalize
     * @returns Normalized transaction data ready for database operations
     */
    normalizeTransaction(action: TransactionAction, transaction: FormMode): ITransactionBase {
        const baseData: ITransactionBase = {
            title: transaction.title,
            action,
            date: new Date(transaction.date).toISOString(),
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
    }
}
