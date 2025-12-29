'use client'

import { IFilterOptions, IImport, IImportsFilters, ITransaction, TransactionStatus } from '@poveroh/types'
import { useError } from './use-error'
import { ImportService } from '@/services/import.service'
import { useImportStore } from '@/store/imports.store'
import { useState } from 'react'
import logger from '@/lib/logger'

type ImportLoadingState = {
    fetchImport: boolean
    removeImport: boolean
    appendImport: boolean
    completeImport: boolean
    readPendingTransaction: boolean
    editPendingTransaction: boolean
    removePendingTransaction: boolean
    parseTransactionFromFile: boolean
}

export const useImport = () => {
    const { handleError } = useError()

    const importService = new ImportService()
    const importStore = useImportStore()

    const [importLoading, setImportLoading] = useState<ImportLoadingState>({
        fetchImport: false,
        removeImport: false,
        appendImport: false,
        completeImport: false,
        readPendingTransaction: false,
        editPendingTransaction: false,
        removePendingTransaction: false,
        parseTransactionFromFile: false
    })

    const setLoadingFor = (key: keyof ImportLoadingState, value: boolean) => {
        setImportLoading(prev => ({ ...prev, [key]: value }))
    }

    const fetchImport = async (filters?: IImportsFilters, options?: IFilterOptions) => {
        setLoadingFor('fetchImport', true)
        try {
            const res = await importService.read<IImport[], IImportsFilters>(filters, options)
            importStore.setImports(res.data)
            return res.data
        } catch (error) {
            handleError(error, 'Error fetching imports')
        } finally {
            setLoadingFor('fetchImport', false)
        }
    }

    const appendImport = async (imports: IImport[]) => {
        setLoadingFor('appendImport', true)
        try {
            importStore.addImport(imports)
            return imports
        } catch (error) {
            return handleError(error, 'Error appending imports')
        } finally {
            setLoadingFor('appendImport', false)
        }
    }

    const removeImport = async (importId: string) => {
        setLoadingFor('removeImport', true)
        try {
            const res = await importService.delete(importId)
            if (!res) throw new Error('No response from server')
            importStore.removeImport(importId)
            return res
        } catch (error) {
            return handleError(error, 'Error deleting import')
        } finally {
            setLoadingFor('removeImport', false)
        }
    }

    const completeImport = async (id: string) => {
        setLoadingFor('completeImport', true)
        try {
            const res = await importService.complete(id)
            importStore.editImport(res)
            return res
        } catch (error) {
            return handleError(error, 'Error saving import')
        } finally {
            setLoadingFor('completeImport', false)
        }
    }

    const readPendingTransaction = async (id: string) => {
        setLoadingFor('readPendingTransaction', true)
        try {
            return await importService.readTransaction(id)
        } catch (error) {
            return handleError(error, 'Error reading pending transactions')
        } finally {
            setLoadingFor('readPendingTransaction', false)
        }
    }

    const editPendingTransaction = async (id: string, data: FormData) => {
        setLoadingFor('editPendingTransaction', true)
        try {
            return await importService.saveTransaction(id, data)
        } catch (error) {
            return handleError(error, 'Error editing transaction')
        } finally {
            setLoadingFor('editPendingTransaction', false)
        }
    }

    const removePendingTransaction = async (transactionId: string) => {
        setLoadingFor('removePendingTransaction', true)
        try {
            const res = await importService.deleteTransaction(transactionId)

            if (!res) {
                throw new Error('No response from server')
            }

            return res
        } catch (error) {
            return handleError(error, 'Error deleting transaction')
        } finally {
            setLoadingFor('removePendingTransaction', false)
        }
    }

    const parseTransactionFromFile = async (data: FormData) => {
        setLoadingFor('parseTransactionFromFile', true)
        try {
            const importData = await importService.readFile(data)
            importStore.setPendingTransactions(importData.transactions)
            appendImport([importData])
            return importData
        } catch (error) {
            return handleError(error, 'Error parsing transaction from file')
        } finally {
            setLoadingFor('parseTransactionFromFile', false)
        }
    }

    const handleApproveTransaction = async (transactionId: string, newValue: TransactionStatus) => {
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

        editPendingTransaction(transactionId, formData)

        importStore.updatePendingTransaction(transaction)
    }

    const handleAllApproveTransactions = (approveAll: boolean) => {
        logger.debug('Handle all transactions approval:', approveAll)

        if (importStore.pendingTransactions.length === 0) {
            logger.debug('No transactions to approve or reject')
            return
        }

        logger.debug(`Setting all transactions to ${approveAll ? 'approved' : 'rejected'}`)

        const newTransactionStatus = approveAll ? TransactionStatus.IMPORT_APPROVED : TransactionStatus.IMPORT_REJECTED

        const updatedTransactions = importStore.pendingTransactions.map(item => ({
            ...item,
            status: newTransactionStatus
        }))

        const formData = new FormData()
        formData.append('data', JSON.stringify(updatedTransactions))

        editPendingTransaction('', formData)

        importStore.setPendingTransactions(updatedTransactions)
    }

    const handleEditTransaction = (transaction: ITransaction) => {
        logger.debug('Edit transaction:', transaction)

        importStore.updatePendingTransaction(transaction)
    }

    const handleDeleteTransaction = (transactionId: string) => {
        logger.debug('Delete transaction:', transactionId)

        importStore.removePendingTransaction(transactionId)
    }

    return {
        importLoading,
        importStore,
        fetchImport,
        removeImport,
        appendImport,
        completeImport,
        readPendingTransaction,
        editPendingTransaction,
        removePendingTransaction,
        parseTransactionFromFile,
        handleApproveTransaction,
        handleAllApproveTransactions,
        handleEditTransaction,
        handleDeleteTransaction
    }
}
