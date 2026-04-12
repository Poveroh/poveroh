'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useError } from './use-error'
import { useUtils } from './use-utils'
import { useFilters } from './use-filters'
import {
    createTransactionMutation,
    deleteTransactionMutation,
    deleteTransactionsMutation,
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
    TransactionFilters,
    FilterOptions,
    TransactionListData
} from '@poveroh/types'

export const useTransaction = () => {
    const queryClient = useQueryClient()
    const { renderItemsLabel } = useUtils()
    const { handleError } = useError()

    const filters = useFilters<TransactionFilters>(text => ({
        title: { contains: text }
    }))

    const createMutation = useMutation({
        ...createTransactionMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getTransactionsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error adding transaction')
        }
    })

    const updateMutation = useMutation({
        ...updateTransactionMutation(),
        onSuccess: (_, variables) => {
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getTransactionsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting transaction')
        }
    })

    const deleteAllMutation = useMutation({
        ...deleteTransactionsMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getTransactionsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting all transactions')
        }
    })

    const getTransactionById = async (transactionId: string) => {
        try {
            const response = await queryClient.fetchQuery(
                getTransactionByIdOptions({
                    path: { id: transactionId }
                })
            )

            if (!response?.success || !response?.data) return null

            return (response?.data ?? null) as TransactionData | null
        } catch (error) {
            return handleError(error, 'Error fetching transaction')
        }
    }

    const fetchTransactions = async (
        transactionFilters?: TransactionFilters,
        options?: FilterOptions
    ): Promise<TransactionListData | null> => {
        try {
            const response = await queryClient.fetchQuery({
                ...getTransactionsOptions({
                    query: {
                        filter: transactionFilters,
                        options
                    }
                }),
                staleTime: 0
            })

            const payload = response?.data
            return {
                data: payload?.data ?? [],
                total: payload?.total ?? 0
            }
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

    return {
        ...filters,
        createMutation,
        updateMutation,
        deleteMutation,
        deleteAllMutation,
        getTransactionById,
        fetchTransactions,
        getActionList,
        groupTransactionsByDate
    }
}
