import prisma from '@poveroh/prisma'
import {
    Currencies,
    ExpensesFormData,
    FormMode,
    IncomeFormData,
    ITransaction,
    ITransactionBase,
    TransactionAction
} from '@poveroh/types'

export const TransactionHelper = {
    async handleTransaction(action: string, data: any, userId: string, transactionId?: string) {
        switch (action) {
            case TransactionAction.TRANSFER:
                return this.handleInternalTransaction(data, userId, transactionId)
            case TransactionAction.INCOME:
                return this.handleIncomeTransaction(data, userId, transactionId)
            case TransactionAction.EXPENSES:
                return this.handleExpensesTransaction(data, userId, transactionId)
            default:
                throw new Error(`Invalid transaction action: ${action}`)
        }
    },

    async handleInternalTransaction(data: any, userId: string, transactionId?: string) {
        let localTransactionId = transactionId || ''

        // If an id is present, we treat this as an edit: update transaction and replace amounts
        if (transactionId) {
            const transaction = await this.fetchTransactionWithAmounts(transactionId)
            if (!transaction) {
                throw new Error(`Transaction with id ${transactionId} not found`)
            }

            await prisma.transaction.update({
                where: { id: transactionId },
                data: { ...data }
            })

            const baseAmount = {
                amount: data.amount,
                currency: data.currency,
                transactionId: transaction.id
            }

            await prisma.amount.createMany({
                data: [
                    { ...baseAmount, action: TransactionAction.EXPENSES, financialAccountId: data.from },
                    { ...baseAmount, action: TransactionAction.INCOME, financialAccountId: data.to }
                ]
            })
        } else {
            const normalizedData = this.normalizeTransaction(TransactionAction.TRANSFER, data)
            const transaction = await this.createTransaction({
                ...normalizedData,
                action: TransactionAction.TRANSFER,
                userId: userId
            })

            const baseAmount = {
                amount: data.amount,
                currency: data.currency,
                transactionId: transaction.id
            }

            await prisma.amount.createMany({
                data: [
                    { ...baseAmount, action: TransactionAction.EXPENSES, financialAccountId: data.from },
                    { ...baseAmount, action: TransactionAction.INCOME, financialAccountId: data.to }
                ]
            })

            localTransactionId = transaction.id
        }

        return await this.fetchTransactionWithAmounts(localTransactionId)
    },
    async handleIncomeTransaction(data: IncomeFormData, userId: string, transactionId?: string) {
        let localTransactionId = transactionId || ''

        // Edit flow: update transaction and replace the single amount
        if (transactionId) {
            const transaction = await this.fetchTransactionWithAmounts(transactionId)
            if (!transaction) {
                throw new Error(`Transaction with id ${transactionId} not found`)
            }

            if (!transaction.amounts || transaction.amounts.length === 0) {
                throw new Error(`No amounts found for transaction with id ${transactionId}`)
            }

            await prisma.transaction.update({
                where: {
                    id: transactionId,
                    userId: userId
                },
                data: {
                    ...data,
                    action: TransactionAction.INCOME,
                    date: new Date(data.date).toISOString()
                }
            })

            await prisma.amount.update({
                where: { id: transaction.amounts[0].id },
                data: {
                    amount: data.amount,
                    currency: data.currency as Currencies,
                    action: TransactionAction.INCOME
                }
            })
        } else {
            const normalizedData = this.normalizeTransaction(TransactionAction.INCOME, data)
            const transaction = await this.createTransaction({
                ...normalizedData,
                action: TransactionAction.INCOME,
                userId: userId
            })

            await prisma.amount.create({
                data: {
                    transactionId: transaction.id,
                    action: TransactionAction.INCOME,
                    amount: data.amount,
                    currency: data.currency as Currencies,
                    financialAccountId: data.financialAccountId
                }
            })

            localTransactionId = transaction.id
        }

        return await this.fetchTransactionWithAmounts(localTransactionId)
    },
    async handleExpensesTransaction(data: any, userId: string, transactionId?: string) {
        // Edit flow: update transaction and replace amounts
        if (transactionId) {
            const transaction = await prisma.transaction.update({
                where: { id: transactionId },
                data: {
                    date: new Date(data.date).toISOString(),
                    ...data
                }
            })

            await prisma.amount.deleteMany({ where: { transactionId: transaction.id } })

            const amountsData = (data.amounts || []).map((element: any) => ({
                transactionId: transaction.id,
                amount: element.amount,
                currency: data.currency,
                action: TransactionAction.EXPENSES,
                financialAccountId: element.financialAccountId
            }))

            // If the client sent a single totalfinancialAccountId (non-multiple split), create one amount
            if (!data.multipleAmount && data.totalfinancialAccountId) {
                amountsData.push({
                    transactionId: transaction.id,
                    amount: data.totalAmount,
                    currency: data.currency,
                    action: TransactionAction.EXPENSES,
                    financialAccountId: data.totalfinancialAccountId
                })
            }

            if (amountsData.length > 0) {
                await prisma.amount.createMany({ data: amountsData })
            }

            return await this.fetchTransactionWithAmounts(transaction.id)
        }

        const normalizedData = this.normalizeTransaction(TransactionAction.EXPENSES, data)
        const transaction = await this.createTransaction({
            ...normalizedData,
            action: TransactionAction.EXPENSES,
            userId: userId
        })

        const amountsData = data.amounts.map((element: any) => ({
            transactionId: transaction.id,
            amount: element.amount,
            currency: data.currency,
            action: TransactionAction.EXPENSES,
            financialAccountId: element.financialAccountId
        }))

        await prisma.amount.createMany({
            data: amountsData
        })

        return await this.fetchTransactionWithAmounts(transaction.id)
    },
    async createTransaction(transactionData: ITransactionBase & { userId: string }) {
        return await prisma.transaction.create({
            data: transactionData
        })
    },
    async fetchTransactionWithAmounts(transactionId: string) {
        return await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { amounts: true }
        })
    },
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
