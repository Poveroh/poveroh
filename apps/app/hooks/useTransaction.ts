'use client'

import { TransactionService } from '@/services/transaction.service'
import { useTransactionStore } from '@/store/transaction.store'
import {
    GroupedTransactions,
    IFilterOptions,
    IItem,
    ITransaction,
    ITransactionFilters,
    TransactionAction
} from '@poveroh/types'
import { useTranslations } from 'next-intl'
import { useError } from './useError'

export const useTransaction = () => {
    const t = useTranslations()
    const { handleError } = useError()

    const transactionService = new TransactionService()
    const transactionStore = useTransactionStore()

    const addTransaction = async (data: FormData) => {
        try {
            const res = await transactionService.add(data)
            transactionStore.addTransaction(res)

            return res
        } catch (error) {
            return handleError(error, 'Error adding transaction')
        }
    }

    const editTransaction = async (id: string, data: FormData) => {
        try {
            const res = await transactionService.save(id, data)
            transactionStore.editTransaction(res)

            return res
        } catch (error) {
            return handleError(error, 'Error editing transaction')
        }
    }

    const removeTransaction = async (transaction_id: string) => {
        try {
            const res = await transactionService.delete(transaction_id)

            if (!res) {
                throw new Error('No response from server')
            }

            transactionStore.removeTransaction(transaction_id)

            return res
        } catch (error) {
            return handleError(error, 'Error deleting transaction')
        }
    }

    const getTransaction = async (transaction_id: string, fetchFromServer?: boolean) => {
        return fetchFromServer
            ? await transactionService.read<ITransaction | null, ITransactionFilters>({ id: transaction_id })
            : transactionStore.getTransaction(transaction_id)
    }

    const fetchTransaction = async (filters?: ITransactionFilters, options?: IFilterOptions, append?: boolean) => {
        const res = await transactionService.read<ITransaction[], ITransactionFilters>(filters, options)

        if (append) transactionStore.appendTransactions(res)
        else transactionStore.setTransaction(res)

        return res
    }

    const getActionList = (excludeInternal?: boolean): IItem[] => {
        const actionList = [
            { value: TransactionAction.INTERNAL, label: t('transactions.types.internalTransfer') },
            { value: TransactionAction.INCOME, label: t('transactions.types.income') },
            { value: TransactionAction.EXPENSES, label: t('transactions.types.expenses') }
        ]
        return excludeInternal ? actionList.filter(({ value }) => value !== TransactionAction.INTERNAL) : actionList
    }

    const groupTransactionsByDate = (transactions: ITransaction[]): GroupedTransactions => {
        return transactions.reduce((acc, transaction) => {
            const dateKey = transaction.date.slice(0, 10)
            if (!acc[dateKey]) {
                acc[dateKey] = []
            }
            acc[dateKey].push(transaction)
            return acc
        }, {} as GroupedTransactions)
    }

    return {
        transactionCacheList: transactionStore.transactionCacheList,
        addTransaction,
        editTransaction,
        removeTransaction,
        getTransaction,
        fetchTransaction,
        getActionList,
        groupTransactionsByDate
    }
}
