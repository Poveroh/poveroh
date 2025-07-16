'use client'

import { IFilterOptions, IImport, IImportsFilters } from '@poveroh/types'
import { useError } from './useError'
import { ImportService } from '@/services/import.service'
import { useImportStore } from '@/store/imports.store'

export const useImport = () => {
    const { handleError } = useError()

    const importService = new ImportService()

    const importStore = useImportStore()

    const fetchImport = async (filters?: IImportsFilters, options?: IFilterOptions) => {
        const res = await importService.read<IImport[], IImportsFilters>(filters, options)

        importStore.setImports(res)

        return res
    }

    const appendImport = async (imports: IImport[]) => {
        importStore.addImport(imports)
        return imports
    }

    const removeImport = async (importId: string) => {
        try {
            const res = await importService.delete(importId)

            if (!res) {
                throw new Error('No response from server')
            }

            importStore.removeImport(importId)

            return res
        } catch (error) {
            return handleError(error, 'Error deleting import')
        }
    }

    const completeImport = async (id: string) => {
        try {
            const res = await importService.complete(id)

            return res
        } catch (error) {
            return handleError(error, 'Error saving import')
        }
    }

    const readPendingTransaction = async (id: string) => {
        try {
            const res = await importService.readTransaction(id)

            return res
        } catch (error) {
            return handleError(error, 'Error reading pending transactions')
        }
    }

    const editPendingTransaction = async (id: string, data: FormData) => {
        try {
            return await importService.saveTransaction(id, data)
        } catch (error) {
            return handleError(error, 'Error editing transaction')
        }
    }

    const removePendingTransaction = async (transactionId: string) => {
        try {
            const res = await importService.deleteTransaction(transactionId)

            if (!res) {
                throw new Error('No response from server')
            }

            return res
        } catch (error) {
            return handleError(error, 'Error deleting transaction')
        }
    }

    const parseTransactionFromFile = async (data: FormData) => {
        return await importService.readFile(data)
    }

    return {
        importCacheList: importStore.importCacheList,
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
