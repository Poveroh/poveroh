'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    GetImportTransactionsResponse,
    ImportTransactionDataResponse,
    ImportTransactionStatusEnum
} from '@poveroh/types'
import { useError } from './use-error'
import {
    approveImportTransactionsMutation,
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

    const approveTransactions = useMutation({
        ...approveImportTransactionsMutation(),
        onError: error => {
            queryClient.invalidateQueries({ queryKey })
            handleError(error, 'Error updating transaction status')
        }
    })

    const approve = (transactionId: string, newStatus: ImportTransactionDataResponse['status']) => {
        if (!importId) return

        setStatus(transaction => transaction.id === transactionId, newStatus)

        approveTransactions.mutate({
            path: { id: importId },
            body: {
                transactions: [{ transactionId, status: newStatus as ImportTransactionStatusEnum }]
            }
        })
    }

    const approveAll = (shouldApprove: boolean) => {
        if (!importId) return

        const transactions = transactionsQuery.data?.data ?? []
        const newStatus: ImportTransactionStatusEnum = shouldApprove ? 'IMPORT_APPROVED' : 'IMPORT_REJECTED'

        setStatus(() => true, newStatus)

        approveTransactions.mutate({
            path: { id: importId },
            body: {
                transactions: transactions.map(t => ({ transactionId: t.id, status: newStatus }))
            }
        })
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
