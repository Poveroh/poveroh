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
import { useError } from './use-error'
import { useState } from 'react'
import { LoadingState } from '@/types/general'

export const useTransaction = () => {
    const t = useTranslations()
    const { handleError } = useError()

    const transactionService = new TransactionService()
    const transactionStore = useTransactionStore()

    const [transactionLoading, setTransactionLoading] = useState<LoadingState>({
        add: false,
        edit: false,
        remove: false,
        get: false,
        fetch: false
    })

    const setLoadingFor = (key: keyof LoadingState, value: boolean) => {
        setTransactionLoading(prev => ({ ...prev, [key]: value }))
    }

    const addTransaction = async (data: FormData) => {
        setLoadingFor('add', true)
        try {
            const res = await transactionService.add(data)
            transactionStore.addTransaction(res)

            return res
        } catch (error) {
            return handleError(error, 'Error adding transaction')
        } finally {
            setLoadingFor('add', false)
        }
    }

    const editTransaction = async (id: string, data: FormData) => {
        setLoadingFor('edit', true)
        try {
            const res = await transactionService.save(id, data)
            transactionStore.editTransaction(res)

            return res
        } catch (error) {
            return handleError(error, 'Error editing transaction')
        } finally {
            setLoadingFor('edit', false)
        }
    }

    const removeTransaction = async (transactionId: string) => {
        setLoadingFor('remove', true)
        try {
            const res = await transactionService.delete(transactionId)

            if (!res) {
                throw new Error('No response from server')
            }

            transactionStore.removeTransaction(transactionId)

            return res
        } catch (error) {
            return handleError(error, 'Error deleting transaction')
        } finally {
            setLoadingFor('remove', false)
        }
    }

    const getTransaction = async (transactionId: string, fetchFromServer?: boolean) => {
        if (fetchFromServer) {
            const res = await transactionService.read<ITransaction | null, ITransactionFilters>({ id: transactionId })
            return res.data
        }
        return transactionStore.getTransaction(transactionId)
    }

    const fetchTransaction = async (
        filters?: ITransactionFilters,
        options?: IFilterOptions,
        append?: boolean,
        forceFetch?: boolean
    ) => {
        setLoadingFor('fetch', true)
        try {
            if (transactionStore.transactionCacheList.length > 0 && !forceFetch) {
                return transactionStore.transactionCacheList
            }
            const res = await transactionService.read<ITransaction[], ITransactionFilters>(filters, options)

            if (append) {
                transactionStore.appendTransactions(res.data)
            } else {
                transactionStore.setTransactions(res.data)
            }

            return res.data
        } catch (error) {
            return handleError(error, 'Error fetching transactions')
        } finally {
            setLoadingFor('fetch', false)
        }
    }

    const getActionList = (excludeInternal?: boolean): IItem[] => {
        const actionList = [
            { value: TransactionAction.INCOME, label: t('transactions.action.income') },
            { value: TransactionAction.EXPENSES, label: t('transactions.action.expenses') },
            { value: TransactionAction.TRANSFER, label: t('transactions.action.internalTransfer') }
        ]
        return excludeInternal ? actionList.filter(({ value }) => value !== TransactionAction.TRANSFER) : actionList
    }

    const fetchTransactionPaginated = async (
        filters?: ITransactionFilters,
        options?: IFilterOptions
    ): Promise<{ data: ITransaction[]; total: number } | null> => {
        setLoadingFor('fetch', true)
        try {
            const res = await transactionService.read<ITransaction[], ITransactionFilters>(filters, options)
            transactionStore.setTransactions(res.data)
            return res
        } catch (error) {
            return handleError(error, 'Error fetching transactions')
        } finally {
            setLoadingFor('fetch', false)
        }
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
        transactionLoading,
        addTransaction,
        editTransaction,
        removeTransaction,
        getTransaction,
        fetchTransaction,
        fetchTransactionPaginated,
        getActionList,
        groupTransactionsByDate
    }
}
