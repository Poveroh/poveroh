import prisma from '@poveroh/prisma'
import { ICsvReadedTransaction, ITransaction, TransactionAction } from '@poveroh/types'
import { v4 as uuidv4 } from 'uuid'

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
            date: new Date(data.date).toISOString(),
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
            date: new Date(data.date).toISOString(),
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
            date: new Date(data.date).toISOString(),
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
    },
    normalizeTransaction(idUser: string, bankAccountId: string, rawTransactions: ICsvReadedTransaction[]) {
        let transactions: ITransaction[] = []

        for (const rawTransaction of rawTransactions) {
            const transactionId = uuidv4()

            transactions.push({
                id: transactionId,
                user_id: idUser,
                created_at: new Date(),
                amounts: [
                    {
                        id: uuidv4(),
                        created_at: new Date().toISOString(),
                        transaction_id: transactionId,
                        amount: rawTransaction.amount,
                        currency: rawTransaction.currency,
                        action: rawTransaction.type,
                        bank_account_id: bankAccountId
                    }
                ],
                title: rawTransaction.title,
                type: rawTransaction.type,
                date: rawTransaction.date.toISOString(),
                ignore: false
            })
        }

        return transactions
    }
}
