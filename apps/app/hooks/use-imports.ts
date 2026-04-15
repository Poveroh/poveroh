'use client'

import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { FilterOptions, ImportFilters } from '@/api/types.gen'
import type { Import, Transaction } from '@/lib/api-client'
import { useError } from './use-error'
import { useImportStore } from '@/store/imports.store'
import { useState } from 'react'
import logger from '@/lib/logger'
import { axiosInstance } from '@/lib/api-client'
import {
    completeImportMutation,
    createImportMutation,
    deleteTransactionMutation,
    deleteImportMutation,
    getImportTransactionsByIdOptions,
    getImportsOptions,
    updateTransactionMutation,
    getImportsQueryKey
} from '@/api/@tanstack/react-query.gen'
import { TransactionData } from '@poveroh/types'
import { useFilters } from './use-filters'

type ImportLoadingState = {
    fetchImports: boolean
    deleteImport: boolean
    appendImports: boolean
    completeImport: boolean
    getImportTransactions: boolean
    updatePendingTransaction: boolean
    deletePendingTransaction: boolean
    createImportFromFile: boolean
}

export const useImport = () => {
    const queryClient = useQueryClient()
    const { handleError } = useError()

    const importStore = useImportStore()

    const filters = useFilters<ImportFilters>(text => ({
        title: { contains: text }
    }))

    const [importQuery] = useQueries({
        queries: [
            {
                ...getImportsOptions(filters.activeFilters ? { query: { filter: filters.activeFilters } } : undefined),
                staleTime: Infinity
            }
        ]
    })

    const [importLoading, setImportLoading] = useState<ImportLoadingState>({
        fetchImports: false,
        deleteImport: false,
        appendImports: false,
        completeImport: false,
        getImportTransactions: false,
        updatePendingTransaction: false,
        deletePendingTransaction: false,
        createImportFromFile: false
    })

    const createImport = useMutation({
        ...createImportMutation(),
        onError: error => {
            handleError(error, 'Error parsing transaction from file')
        }
    })

    const deleteAllMutation = useMutation({
        ...deleteImportMutation(),
        onSuccess: (_, variables) => {
            importStore.removeImport(variables.path.id)

            queryClient.invalidateQueries({ queryKey: getImportsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting all imports')
        }
    })

    const completeImportMutationHook = useMutation({
        ...completeImportMutation(),
        onSuccess: data => {
            const completedImport = data?.data as Import | undefined
            if (completedImport) {
                importStore.editImport(completedImport)
            }
        },
        onError: error => {
            handleError(error, 'Error saving import')
        }
    })

    const updatePendingTransactionMutationHook = useMutation({
        ...updateTransactionMutation(),
        onError: error => {
            handleError(error, 'Error editing transaction')
        }
    })

    const deletePendingTransactionMutationHook = useMutation({
        ...deleteTransactionMutation(),
        onError: error => {
            handleError(error, 'Error deleting transaction')
        }
    })

    const setLoadingFor = (key: keyof ImportLoadingState, value: boolean) => {
        setImportLoading(prev => ({ ...prev, [key]: value }))
    }

    const fetchImports = async (filters?: ImportFilters, options?: FilterOptions) => {
        setLoadingFor('fetchImports', true)
        try {
            const response = await queryClient.fetchQuery(
                getImportsOptions({
                    query: {
                        filter: filters,
                        options
                    }
                })
            )

            if (!response?.success) return []

            const data = (response?.data ?? []) as Import[]
            importStore.setImports(data)

            return data
        } catch (error) {
            return handleError(error, 'Error fetching imports')
        } finally {
            setLoadingFor('fetchImports', false)
        }
    }

    const appendImports = async (imports: Import[]) => {
        setLoadingFor('appendImports', true)
        try {
            importStore.addImport(imports)
            return imports
        } catch (error) {
            return handleError(error, 'Error appending imports')
        } finally {
            setLoadingFor('appendImports', false)
        }
    }

    const deleteImport = async (importId: string) => {
        setLoadingFor('deleteImport', true)
        try {
            return await deleteImportMutationHook.mutateAsync({
                path: { id: importId }
            })
        } catch (error) {
            return handleError(error, 'Error deleting import')
        } finally {
            setLoadingFor('deleteImport', false)
        }
    }

    const completeImport = async (id: string) => {
        setLoadingFor('completeImport', true)
        try {
            return await completeImportMutationHook.mutateAsync({
                path: { id }
            })
        } catch (error) {
            return handleError(error, 'Error saving import')
        } finally {
            setLoadingFor('completeImport', false)
        }
    }

    const getImportTransactions = async (id: string) => {
        setLoadingFor('getImportTransactions', true)
        try {
            const response = await queryClient.fetchQuery(
                getImportTransactionsByIdOptions({
                    path: { id }
                })
            )

            if (!response?.success) return null

            return (response?.data ?? []) as Transaction[]
        } catch (error) {
            return handleError(error, 'Error reading pending transactions')
        } finally {
            setLoadingFor('getImportTransactions', false)
        }
    }

    const updatePendingTransaction = async (id: string, data: FormData) => {
        setLoadingFor('updatePendingTransaction', true)
        try {
            const payload = JSON.parse(String(data.get('data') || '[]')) as TransactionData[]

            if (payload.length === 0) return null

            const updatedTransactions = await Promise.all(
                payload.map(async transaction => {
                    const transactionId = transaction.id || id
                    if (!transactionId) {
                        throw new Error('Missing transaction ID')
                    }

                    // const response = await updatePendingTransactionMutationHook.mutateAsync({
                    //     path: { id: transactionId },
                    //     body: transaction
                    // })

                    // const updated = (response?.data ?? transaction) as TransactionData
                    // importStore.updatePendingTransaction(updated)
                    // return updated
                    return null
                })
            )

            return id ? updatedTransactions[0] : updatedTransactions
        } catch (error) {
            return handleError(error, 'Error editing transaction')
        } finally {
            setLoadingFor('updatePendingTransaction', false)
        }
    }

    const deletePendingTransaction = async (transactionId: string) => {
        setLoadingFor('deletePendingTransaction', true)
        try {
            const response = await deletePendingTransactionMutationHook.mutateAsync({
                path: { id: transactionId }
            })

            importStore.removePendingTransaction(transactionId)

            return response
        } catch (error) {
            return handleError(error, 'Error deleting transaction')
        } finally {
            setLoadingFor('deletePendingTransaction', false)
        }
    }

    const createImportFromFile = async (data: FormData) => {
        setLoadingFor('createImportFromFile', true)
        try {
            const financialAccountId = String(data.get('financialAccountId') || '')
            const files = data.getAll('files').filter(item => item instanceof File)

            const response = await createImportMutationHook.mutateAsync({
                body: {
                    data: {
                        financialAccountId
                    },
                    file: files as Array<Blob | File>
                }
            })

            const importData = (response?.data ?? null) as Import | null
            if (!importData) return null

            const transactions = await getImportTransactions(importData.id)
            const hydratedImport = {
                ...importData,
                transactions: transactions ?? []
            }

            importStore.setPendingTransactions(hydratedImport.transactions)
            await appendImports([hydratedImport])

            return importData
        } catch (error) {
            return handleError(error, 'Error parsing transaction from file')
        } finally {
            setLoadingFor('createImportFromFile', false)
        }
    }

    const handleApproveTransaction = async (transactionId: string, newValue: 'IMPORT_APPROVED' | 'IMPORT_REJECTED') => {
        logger.debug('Toggle approve transaction:', transactionId)

        const transaction = importStore.pendingTransactions.find(t => t.id === transactionId)

        if (!transaction) {
            logger.error('Transaction not found:', transactionId)
            return
        }

        if (transaction.status === newValue) return

        transaction.status = newValue

        const formData = new FormData()
        formData.append('data', JSON.stringify([transaction]))

        updatePendingTransaction(transactionId, formData)

        importStore.updatePendingTransaction(transaction)
    }

    const handleAllApproveTransactions = (approveAll: boolean) => {
        logger.debug('Handle all transactions approval:', approveAll)

        if (importStore.pendingTransactions.length === 0) {
            logger.debug('No transactions to approve or reject')
            return
        }

        logger.debug(`Setting all transactions to ${approveAll ? 'approved' : 'rejected'}`)

        const newTransactionStatus = approveAll ? 'IMPORT_APPROVED' : 'IMPORT_REJECTED'

        const updatedTransactions = importStore.pendingTransactions.map(item => ({
            ...item,
            status: newTransactionStatus as Transaction['status']
        }))

        const formData = new FormData()
        formData.append('data', JSON.stringify(updatedTransactions))

        updatePendingTransaction('', formData)

        importStore.setPendingTransactions(updatedTransactions as Transaction[])
    }

    const handleEditTransaction = (transaction: Transaction) => {
        logger.debug('Edit transaction:', transaction)

        importStore.updatePendingTransaction(transaction)
    }

    const handleDeleteTransaction = (transactionId: string) => {
        logger.debug('Delete transaction:', transactionId)

        importStore.removePendingTransaction(transactionId)
    }

    const importTemplates = async (action: string) => {
        try {
            await axiosInstance.post('/imports/template', { action })
            logger.debug('Template import successful for action:', action)
            return true
        } catch (error) {
            handleError(error, 'Error importing template')
            return false
        }
    }

    return {
        filters,
        importStore,
        importQuery,
        importData: importQuery.data?.data ?? [],
        createImport,
        deleteAllMutation,

        // ----
        fetchImports,
        deleteImport,
        appendImports,
        completeImport,
        getImportTransactions,
        updatePendingTransaction,
        deletePendingTransaction,
        createImportFromFile,
        handleApproveTransaction,
        handleAllApproveTransactions,
        handleEditTransaction,
        handleDeleteTransaction,
        importTemplates
    }
}
