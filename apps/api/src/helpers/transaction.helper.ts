import prisma from '@poveroh/prisma'
import { TransactionAction } from '@poveroh/types'

export const TransactionHelper = {
    async handleTransaction(action: string, data: any, userId: string) {
        switch (action) {
            case TransactionAction.INTERNAL:
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
            type: TransactionAction.INTERNAL,
            date: data.date,
            note: data.note,
            ignore: data.ignore,
            user_id: userId
        })

        const baseAmount = {
            amount: data.amount,
            currency: data.currency,
            transaction_id: transaction.id
        }

        await prisma.amounts.createMany({
            data: [
                { ...baseAmount, action: TransactionAction.EXPENSES, bank_account_id: data.from },
                { ...baseAmount, action: TransactionAction.INCOME, bank_account_id: data.to }
            ]
        })

        return await this.fetchTransactionWithAmounts(transaction.id)
    },
    async handleIncomeTransaction(data: any, userId: string) {
        const transaction = await this.createTransaction({
            title: data.title,
            type: TransactionAction.INCOME,
            category_id: data.category_id,
            subcategory_id: data.subcategory_id,
            date: data.date,
            note: data.note,
            ignore: data.ignore,
            user_id: userId
        })

        await prisma.amounts.create({
            data: {
                amount: data.amount,
                currency: data.currency,
                transaction_id: transaction.id,
                action: TransactionAction.INCOME,
                bank_account_id: data.bank_account_id
            }
        })

        return await this.fetchTransactionWithAmounts(transaction.id)
    },
    async handleExpensesTransaction(data: any, userId: string) {
        const transaction = await this.createTransaction({
            title: data.title,
            type: TransactionAction.EXPENSES,
            category_id: data.category_id,
            subcategory_id: data.subcategory_id,
            date: data.date,
            note: data.note,
            ignore: data.ignore,
            user_id: userId
        })

        const amountsData = data.amounts.map((element: any) => ({
            transaction_id: transaction.id,
            amount: element.amount,
            currency: data.currency,
            action: TransactionAction.EXPENSES,
            bank_account_id: data.bank_account_id
        }))

        await prisma.amounts.createMany({
            data: amountsData
        })

        return await this.fetchTransactionWithAmounts(transaction.id)
    },
    async createTransaction(transactionData: any) {
        return await prisma.transactions.create({
            data: transactionData
        })
    },
    async fetchTransactionWithAmounts(transactionId: string) {
        return await prisma.transactions.findUnique({
            where: { id: transactionId },
            include: { amounts: true }
        })
    }
}
