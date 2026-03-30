'use client'

import { toast } from '@poveroh/ui/components/sonner'
import { useIsFetching, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTransactionStore } from '@/store/transaction.store'
import { useError } from './use-error'
import { LoadingState } from '@/types/general'
import { useCategory } from './use-category'
import { useFinancialAccount } from './use-account'
import { useUtils } from './use-utils'
import {
    createTransactionMutation,
    deleteTransactionMutation,
    getTransactionByIdOptions,
    getTransactionByIdQueryKey,
    getTransactionsOptions,
    getTransactionsQueryKey,
    updateTransactionMutation
} from '@/api/@tanstack/react-query.gen'
import {
    GroupedTransactions,
    TransactionActionCatalog,
    TransactionData,
    FilterOptions,
    TransactionFilters
} from '@poveroh/types'
import { useTranslations } from 'next-intl'

export const useTransaction = () => {
    const queryClient = useQueryClient()
    const t = useTranslations()
    const { renderItemsLabel } = useUtils()
    const { handleError } = useError()
    const { categoryQuery } = useCategory()
    const { accountQuery } = useFinancialAccount()

    const transactionStore = useTransactionStore()

    const createMutation = useMutation({
        ...createTransactionMutation(),
        onSuccess: data => {
            if (data.message && !data.success) {
                toast.error(t(data.message))
            }

            const transaction = data?.data
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
            if (data.message && !data.success) {
                toast.error(t(data.message))
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

            if (!response?.success || !response?.data) return null

            return response?.data
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
                await categoryQuery.refetch()
                await accountQuery.refetch()
            }

            const response = await queryClient.fetchQuery(
                getTransactionsOptions({
                    query: {
                        filter: filters,
                        options
                    }
                })
            )

            if (append) {
                transactionStore.appendTransactions(response.data)
            } else {
                transactionStore.setTransactions(response.data)
            }

            return response.data
        } catch (error) {
            return handleError(error, 'Error fetching transactions')
        }
    }

    const getActionList = (excludeInternal?: boolean) => {
        const actionList = excludeInternal
            ? TransactionActionCatalog.filter(({ value }) => value !== 'TRANSFER')
            : TransactionActionCatalog

        return renderItemsLabel(actionList)
    }

    const fetchTransactionPaginated = async (
        filters?: TransactionFilters,
        options?: FilterOptions
    ): Promise<{ data: TransactionData[]; total: number } | null> => {
        try {
            const response = await queryClient.fetchQuery(
                getTransactionsOptions({
                    query: {
                        filter: filters,
                        options
                    }
                })
            )

            const responsePayload = response?.data as unknown as { data: TransactionData[]; total: number } | undefined
            const data = responsePayload?.data ?? []
            const total = Number(responsePayload?.total ?? data.length)

            transactionStore.setTransactions(data)

            return { data, total }
        } catch (error) {
            return handleError(error, 'Error fetching transactions')
        }
    }

    const groupTransactionsByDate = (transactions: TransactionData[]): GroupedTransactions => {
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
