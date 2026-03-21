'use client'

import { useIsFetching, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTransactionStore } from '@/store/transaction.store'
import { FilterOptions, TransactionFilters } from '@/api/types.gen'
import type { Transaction } from '@/lib/api-client'
import { useTranslations } from 'next-intl'
import { useError } from './use-error'
import { LoadingState } from '@/types/general'
import { useCategory } from './use-category'
import { useFinancialAccount } from './use-account'
import {
    createTransactionMutation,
    deleteTransactionMutation,
    getTransactionByIdOptions,
    getTransactionByIdQueryKey,
    getTransactionsOptions,
    getTransactionsQueryKey,
    updateTransactionMutation
} from '@/api/@tanstack/react-query.gen'

type GroupedTransactions = Record<string, Transaction[]>
type ActionItem = {
    value: 'INCOME' | 'EXPENSES' | 'TRANSFER'
    label: string
}

export const useTransaction = () => {
    const queryClient = useQueryClient()
    const t = useTranslations()
    const { handleError } = useError()
    const { fetchCategories } = useCategory()
    const { fetchFinancialAccounts } = useFinancialAccount()

    const transactionStore = useTransactionStore()

    const createMutation = useMutation({
        ...createTransactionMutation(),
        onSuccess: data => {
            const transaction = data?.data as Transaction | undefined
            if (transaction) {
                transactionStore.addTransaction(transaction)
            }
            queryClient.invalidateQueries({ queryKey: getTransactionsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error creating transaction')
        }
    })

    const updateMutation = useMutation({
        ...updateTransactionMutation(),
        onSuccess: (data, variables) => {
            const transaction = (data?.data ?? variables.body) as Transaction | undefined
            if (transaction) {
                transactionStore.editTransaction(transaction)
            }

            queryClient.invalidateQueries({ queryKey: getTransactionsQueryKey() })
            queryClient.invalidateQueries({
                queryKey: getTransactionByIdQueryKey({
                    path: { id: variables.path.id }
                })
            })
        },
        onError: error => {
            handleError(error, 'Error updating transaction')
        }
    })

    const deleteMutation = useMutation({
        ...deleteTransactionMutation(),
        onSuccess: (_, variables) => {
            transactionStore.removeTransaction(variables.path.id)
            queryClient.invalidateQueries({ queryKey: getTransactionsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting transaction')
        }
    })

    const getTransaction = async (transactionId: string) => {
        try {
            const response = await queryClient.fetchQuery(
                getTransactionByIdOptions({
                    path: { id: transactionId }
                })
            )

            if (!response?.success) return null

            return (response?.data ?? null) as Transaction | null
        } catch (error) {
            return handleError(error, 'Error fetching transaction')
        }
    }

    const fetchTransaction = async (
        filters?: TransactionFilters,
        options?: FilterOptions,
        append?: boolean,
        forceFetch?: boolean,
        prefetchCategoryAndAccount?: boolean
    ) => {
        try {
            if (prefetchCategoryAndAccount) {
                await fetchCategories()
                await fetchFinancialAccounts()
            }

            if (transactionStore.transactionCacheList.length > 0 && !forceFetch) {
                return transactionStore.transactionCacheList
            }

            const response = await queryClient.fetchQuery(
                getTransactionsOptions({
                    query: {
                        filter: filters,
                        options
                    }
                })
            )

            const data = (response?.data ?? []) as Transaction[]

            if (append) {
                transactionStore.appendTransactions(data)
            } else {
                transactionStore.setTransactions(data)
            }

            return data
        } catch (error) {
            return handleError(error, 'Error fetching transactions')
        }
    }

    const getActionList = (excludeInternal?: boolean): ActionItem[] => {
        const actionList = [
            { value: 'INCOME' as const, label: t('transactions.action.income') },
            { value: 'EXPENSES' as const, label: t('transactions.action.expenses') },
            { value: 'TRANSFER' as const, label: t('transactions.action.internalTransfer') }
        ]
        return excludeInternal ? actionList.filter(({ value }) => value !== 'TRANSFER') : actionList
    }

    const fetchTransactionPaginated = async (
        filters?: TransactionFilters,
        options?: FilterOptions
    ): Promise<{ data: Transaction[]; total: number } | null> => {
        try {
            const response = await queryClient.fetchQuery(
                getTransactionsOptions({
                    query: {
                        filter: filters,
                        options
                    }
                })
            )

            const data = (response?.data ?? []) as Transaction[]
            const total = Number((response as { total?: number } | undefined)?.total ?? data.length)

            transactionStore.setTransactions(data)

            return { data, total }
        } catch (error) {
            return handleError(error, 'Error fetching transactions')
        }
    }

    const groupTransactionsByDate = (transactions: Transaction[]): GroupedTransactions => {
        return transactions.reduce((acc, transaction) => {
            const dateKey = transaction.date.slice(0, 10)
            if (!acc[dateKey]) {
                acc[dateKey] = []
            }
            acc[dateKey].push(transaction)
            return acc
        }, {} as GroupedTransactions)
    }

    const transactionLoading: LoadingState = {
        create: createMutation.isPending,
        update: updateMutation.isPending,
        delete: deleteMutation.isPending,
        fetch: useIsFetching({ queryKey: getTransactionsQueryKey() }) > 0,
        get:
            useIsFetching({
                predicate: query => {
                    const key = query.queryKey?.[0] as { _id?: string } | undefined
                    return key?._id === 'getTransactionById'
                }
            }) > 0
    }

    return {
        transactionCacheList: transactionStore.transactionCacheList,
        transactionLoading,
        createTransaction: createMutation.mutateAsync,
        updateTransaction: updateMutation.mutateAsync,
        deleteTransaction: deleteMutation.mutateAsync,
        getTransaction,
        fetchTransaction,
        fetchTransactionPaginated,
        getActionList,
        groupTransactionsByDate
    }
}
