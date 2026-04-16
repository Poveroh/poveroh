'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GetImportTransactionsResponse, ImportTransactionDataResponse } from '@poveroh/types'
import { useError } from './use-error'
import {
    deleteTransactionMutation,
    getImportsQueryKey,
    getImportTransactionsByIdOptions,
    getImportTransactionsByIdQueryKey
} from '@/api/@tanstack/react-query.gen'

export const useImportTransactions = (importId: string | undefined) => {
    const queryClient = useQueryClient()
    const { handleError } = useError()

    const queryKey = getImportTransactionsByIdQueryKey({ path: { id: importId ?? '' } })

    const transactionsQuery = useQuery({
        ...getImportTransactionsByIdOptions({ path: { id: importId ?? '' } }),
        enabled: Boolean(importId)
    })

    const setStatus = (
        predicate: (transaction: ImportTransactionDataResponse) => boolean,
        newStatus: ImportTransactionDataResponse['status']
    ) => {
        queryClient.setQueryData<GetImportTransactionsResponse>(queryKey, prev => {
            if (!prev) return prev
            return {
                ...prev,
                data: prev.data.map(transaction =>
                    predicate(transaction) ? { ...transaction, status: newStatus } : transaction
                )
            }
        })
    }

    const removeFromCache = (transactionId: string) => {
        queryClient.setQueryData<GetImportTransactionsResponse>(queryKey, prev => {
            if (!prev) return prev
            return {
                ...prev,
                data: prev.data.filter(transaction => transaction.id !== transactionId)
            }
        })
    }

    const approve = (transactionId: string, newStatus: ImportTransactionDataResponse['status']) => {
        setStatus(transaction => transaction.id === transactionId, newStatus)
    }

    const approveAll = (approveAll: boolean) => {
        setStatus(() => true, approveAll ? 'IMPORT_APPROVED' : 'IMPORT_REJECTED')
    }

    const deletePendingTransaction = useMutation({
        ...deleteTransactionMutation(),
        onSuccess: (_data, variables) => {
            removeFromCache(variables.path.id)
            queryClient.invalidateQueries({ queryKey: getImportsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting transaction')
        }
    })

    return {
        transactionsQuery,
        transactions: transactionsQuery.data?.data ?? [],
        approve,
        approveAll,
        deletePendingTransaction
    }
}
