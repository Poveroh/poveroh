import prisma from '@poveroh/prisma'
import { TransactionAction } from '@poveroh/types'

export const TransactionHelper = {
    async handleTransaction(action: string, data: any, userId: string) {
        switch (action) {
            case TransactionAction.TRANSFER:
                return this.handleInternalTransaction(data, userId)
            case TransactionAction.INCOME:
                return this.handleIncomeTransaction(data, userId)
            case TransactionAction.EXPENSES:
                return this.handleExpensesTransaction(data, userId)
            default:
                throw new Error(`Invalid transaction action: ${action}`)
        }
    },

    async handleInternalTransaction(data: any, userId: string) {
        const transaction = await this.createTransaction({
            title: data.title,
            action: TransactionAction.TRANSFER,
            date: new Date(data.date).toISOString(),
            note: data.note,
            ignore: data.ignore,
            userId: userId
        })

        const baseAmount = {
            amount: data.amount,
            currency: data.currency,
            transactionId: transaction.id
        }

        await prisma.amount.createMany({
            data: [
                { ...baseAmount, action: TransactionAction.EXPENSES, accountId: data.from },
                { ...baseAmount, action: TransactionAction.INCOME, accountId: data.to }
            ]
        })

        return await this.fetchTransactionWithAmounts(transaction.id)
    },
    async handleIncomeTransaction(data: any, userId: string) {
        const transaction = await this.createTransaction({
            title: data.title,
            action: TransactionAction.INCOME,
            categoryId: data.categoryId,
            subcategoryId: data.subcategoryId,
            date: new Date(data.date).toISOString(),
            note: data.note,
            ignore: data.ignore,
            userId: userId
        })

        await prisma.amount.create({
            data: {
                amount: data.amount,
                currency: data.currency,
                transactionId: transaction.id,
                action: TransactionAction.INCOME,
                accountId: data.accountId
            }
        })

        return await this.fetchTransactionWithAmounts(transaction.id)
    },
    async handleExpensesTransaction(data: any, userId: string) {
        const transaction = await this.createTransaction({
            title: data.title,
            action: TransactionAction.EXPENSES,
            categoryId: data.categoryId,
            subcategoryId: data.subcategoryId,
            date: new Date(data.date).toISOString(),
            note: data.note,
            ignore: data.ignore,
            userId: userId
        })

        const amountsData = data.amounts.map((element: any) => ({
            transactionId: transaction.id,
            amount: element.amount,
            currency: data.currency,
            action: TransactionAction.EXPENSES,
            accountId: element.accountId
        }))

        await prisma.amount.createMany({
            data: amountsData
        })

        return await this.fetchTransactionWithAmounts(transaction.id)
    },
    async createTransaction(transactionData: any) {
        return await prisma.transaction.create({
            data: transactionData
        })
    },
    async fetchTransactionWithAmounts(transactionId: string) {
        return await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { amounts: true }
        })
    }
}
