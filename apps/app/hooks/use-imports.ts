'use client'

import { IFilterOptions, IImport, IImportsFilters } from '@poveroh/types'
import { useError } from './use-error'
import { ImportService } from '@/services/import.service'
import { useImportStore } from '@/store/imports.store'
import { useState } from 'react'

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
            importStore.setImports(res)
            return res
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
            return await importService.complete(id)
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
            return await importService.readFile(data)
        } catch (error) {
            return handleError(error, 'Error parsing transaction from file')
        } finally {
            setLoadingFor('parseTransactionFromFile', false)
        }
    }

    return {
        importCacheList: importStore.importCacheList,
        importLoading,
        fetchImport,
        removeImport,
        appendImport,
        completeImport,
        readPendingTransaction,
        editPendingTransaction,
        removePendingTransaction,
        parseTransactionFromFile
    }
}
