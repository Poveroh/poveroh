import prisma from '@poveroh/prisma'
import moment from 'moment-timezone'
import { TransactionFormData } from '@poveroh/types'
import { BalanceHelper } from './balance.helper'

//TODO - complete files

/**
 * Transaction Helper - Handles all transaction operations including creation and updating of transactions
 */
export const TransactionHelper = {
    /**
     * Main entry point for handling all transaction operations
     * @param data - The unified form data containing transaction details
     * @param userId - The ID of the user creating/updating the transaction
     * @param transactionId - Optional ID for updating existing transactions
     * @returns Promise resolving to the created/updated transaction with amounts
     */
    async handleTransaction(data: TransactionFormData, userId: string, transactionId?: string) {
        this.validateTransactionData(data)

        if (!userId) {
            throw new Error('User ID is required')
        }

        switch (data.action) {
            case 'TRANSFER':
                return this.handleTransferTransaction(data, userId, transactionId)
            case 'INCOME':
            case 'EXPENSES':
                return this.handleStandardTransaction(data, userId, transactionId)
            default:
                throw new Error(`Invalid transaction action: ${data.action}`)
        }
    },

    validateTransactionData(data: TransactionFormData): void {
        if (!data.title || data.title.trim().length === 0) {
            throw new Error('Transaction title is required')
        }

        if (!data.date) {
            throw new Error('Transaction date is required')
        }

        const date = new Date(data.date)
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date format')
        }

        if (!data.amounts || data.amounts.length === 0) {
            throw new Error('At least one amount is required')
        }

        data.amounts.forEach((amount, index) => {
            if (!amount.amount || amount.amount <= 0) {
                throw new Error(`Amount at position ${index + 1} must be greater than 0`)
            }
            if (!amount.financialAccountId) {
                throw new Error(`Financial account at position ${index + 1} is required`)
            }
        })

        if (data.action === 'TRANSFER') {
            const fromAmount = data.amounts.find(a => a.action === 'EXPENSES')
            const toAmount = data.amounts.find(a => a.action === 'INCOME')
            if (!fromAmount || !toAmount) {
                throw new Error('Both source and destination accounts are required for transfers')
            }
            if (fromAmount.financialAccountId === toAmount.financialAccountId) {
                throw new Error('Source and destination accounts cannot be the same')
            }
        }

        if ((data.action === 'INCOME' || data.action === 'EXPENSES') && !data.categoryId) {
            throw new Error('Category is required')
        }
    },

    /**
     * Handles INCOME and EXPENSES transactions (single or split amounts)
     */
    async handleStandardTransaction(data: TransactionFormData, userId: string, transactionId?: string) {
        let resultTransactionId = transactionId || ''

        try {
            if (transactionId) {
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
                            where: { id: transactionId, userId },
                            data: this.normalizeTransaction(data)
                        })

                        // Delete existing amounts and create new ones
                        await tx.amount.deleteMany({
                            where: { transactionId }
                        })

                        const amountsData = this.buildAmounts(transactionId, data)
                        await tx.amount.createMany({ data: amountsData })

                        const originalAmountsMap = new Map(
                            existingTransaction.amounts.map((amt, idx) => [
                                amountsData[idx]?.transactionId,
                                amt?.amount.toNumber()
                            ])
                        )
                        await BalanceHelper.updateAccountBalances(amountsData, originalAmountsMap, tx)

                        resultTransactionId = transactionId
                    },
                    { timeout: 30000 }
                )
            } else {
                const normalizedData = this.normalizeTransaction(data)
                await prisma.$transaction(
                    async tx => {
                        const transaction = await tx.transaction.create({
                            data: { ...normalizedData, userId }
                        })

                        const amountsData = this.buildAmounts(transaction.id, data)
                        await tx.amount.createMany({ data: amountsData })

                        for (let i = 0; i < amountsData.length; i++) {
                            await BalanceHelper.updateAccountBalances(amountsData[i], undefined, tx)
                        }

                        resultTransactionId = transaction.id
                    },
                    { timeout: 30000 }
                )
            }

            return await this.fetchTransactionWithAmounts(resultTransactionId)
        } catch (error) {
            throw new Error(
                `Failed to handle ${data.action.toLowerCase()} transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    },

    async handleTransferTransaction(data: TransactionFormData, userId: string, transactionId?: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { timezone: true }
        })
        if (!user) {
            throw new Error('User not found')
        }

        const utcDate = moment.tz(data.date, user.timezone).utc().toISOString()
        const fromAmount = data.amounts.find(a => a.action === 'EXPENSES')!
        const toAmount = data.amounts.find(a => a.action === 'INCOME')!

        let localTransferId = transactionId || ''

        try {
            if (transactionId) {
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
                            data: this.normalizeTransaction(data)
                        })

                        await tx.amount.deleteMany({
                            where: { transactionId }
                        })

                        const amountsData = [
                            this.createAmountData({
                                transactionId: transaction.id,
                                amount: fromAmount.amount,
                                currency: data.currency,
                                action: 'EXPENSES',
                                financialAccountId: fromAmount.financialAccountId
                            }),
                            this.createAmountData({
                                transactionId: transaction.id,
                                amount: toAmount.amount,
                                currency: data.currency,
                                action: 'INCOME',
                                financialAccountId: toAmount.financialAccountId
                            })
                        ]

                        await tx.amount.createMany({ data: amountsData })

                        const originalAmountsMap = new Map(
                            originalAmounts.map((amt, idx) => [amountsData[idx].transactionId, amt?.amount.toNumber()])
                        )
                        await BalanceHelper.updateAccountBalances(amountsData, originalAmountsMap, tx)
                    },
                    { timeout: 30000 }
                )
            } else {
                const normalizedData = {
                    ...this.normalizeTransaction(data),
                    userId
                }

                await prisma.$transaction(
                    async tx => {
                        const transactions = await tx.transaction.createManyAndReturn({
                            data: [normalizedData, normalizedData]
                        })

                        const amountsData = [
                            this.createAmountData({
                                transactionId: transactions[0].id,
                                amount: fromAmount.amount,
                                currency: data.currency,
                                action: 'EXPENSES',
                                financialAccountId: fromAmount.financialAccountId
                            }),
                            this.createAmountData({
                                transactionId: transactions[1].id,
                                amount: toAmount.amount,
                                currency: data.currency,
                                action: 'INCOME',
                                financialAccountId: toAmount.financialAccountId
                            })
                        ]

                        await tx.amount.createMany({ data: amountsData })

                        for (let i = 0; i < amountsData.length; i++) {
                            await BalanceHelper.updateAccountBalances(amountsData[i], undefined, tx)
                        }

                        const transfer = await tx.transfer.create({
                            data: {
                                transferDate: utcDate,
                                note: data.note,
                                fromTransactionId: transactions[0].id,
                                toTransactionId: transactions[1].id,
                                userId
                            }
                        })

                        await tx.transaction.updateMany({
                            where: { id: { in: [transactions[0].id, transactions[1].id] } },
                            data: { transferId: transfer.id }
                        })

                        localTransferId = transfer.id
                    },
                    { timeout: 30000 }
                )
            }

            return await this.fetchTransferTransaction(localTransferId)
        } catch (error) {
            throw new Error(
                `Failed to handle transfer transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    },

    /**
     * Builds amount entries from the unified TransactionFormData amounts array
     */
    buildAmounts(transactionId: string, data: TransactionFormData) {
        const amountsData = data.amounts.map(element =>
            this.createAmountData({
                transactionId,
                amount: element.amount,
                currency: data.currency,
                action: element.action,
                financialAccountId: element.financialAccountId
            })
        )

        if (amountsData.length === 0) {
            throw new Error('No valid amounts provided for transaction')
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

        const transaction = {
            id: transferId,
            date: transfer.transferDate.toISOString(),
            note: transfer.note,
            userId: transfer.userId,
            amounts: [
                ...transfer.fromTransaction.amounts.map(a => ({
                    ...a,
                    amount: a.amount.toNumber(),
                    currency: a.currency,
                    action: a.action,
                    importReference: a.importReference || undefined,
                    createdAt: a.createdAt.toISOString()
                })),
                ...transfer.toTransaction.amounts.map(a => ({
                    ...a,
                    amount: a.amount.toNumber(),
                    currency: a.currency,
                    action: a.action,
                    importReference: a.importReference || undefined,
                    createdAt: a.createdAt.toISOString()
                }))
            ],
            transferId: transfer.id,
            title: transfer.fromTransaction.title,
            action: 'TRANSFER',
            createdAt: transfer.transferDate.toISOString(),
            updatedAt: transfer.transferDate.toISOString(),
            status: 'APPROVED',
            ignore: false
        }

        return transaction
    },

    normalizeTransaction(data: TransactionFormData) {
        const baseData = {
            title: data.title,
            action: data.action,
            date: new Date(data.date).toISOString(),
            note: data.note,
            ignore: data.ignore || false,
            categoryId: null as string | null,
            subcategoryId: null as string | null
        }

        if (data.action === 'INCOME' || data.action === 'EXPENSES') {
            baseData.categoryId = data.categoryId || null
            baseData.subcategoryId = data.subcategoryId || null
        }

        return baseData
    },

    /**
     * Creates or converts an Amount object to IAmountBase
     */
    createAmountData(
        params:
            | { dbAmount: any }
            | {
                  transactionId: string
                  amount: number
                  currency: string
                  action: 'INCOME' | 'EXPENSES' | 'TRANSFER'
                  financialAccountId: string
              }
    ): any {
        if ('dbAmount' in params) {
            const dbAmount = params.dbAmount
            return {
                transactionId: dbAmount.transactionId,
                amount: typeof dbAmount.amount === 'number' ? dbAmount.amount : dbAmount.amount.toNumber(),
                currency: dbAmount.currency,
                action: dbAmount.action,
                financialAccountId: dbAmount.financialAccountId
            }
        }

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
            currency,
            action: action as 'INCOME' | 'EXPENSES' | 'TRANSFER',
            financialAccountId
        }
    },

    /**
     * Merges TRANSFER transactions that share the same transferId into a single transaction object.
     * The merged transaction will contain both amounts (INCOME and EXPENSES).
     */
    mergeTransferTransactions(transactions: any[]): any[] {
        const transferMap = new Map<string, any>()
        const result: any[] = []

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
}
