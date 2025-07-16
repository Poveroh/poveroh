'use client'

import { IFilterOptions, IImports, IImportsFilters } from '@poveroh/types'
import { useError } from './useError'
import { ImportService } from '@/services/import.service'
import { useImportsStore } from '@/store/imports.store'

export const useImports = () => {
    const { handleError } = useError()

    const importService = new ImportService()

    const importsStore = useImportsStore()

    const fetchImports = async (filters?: IImportsFilters, options?: IFilterOptions) => {
        const res = await importService.read<IImports[], IImportsFilters>(filters, options)

        importsStore.setImports(res)

        return res
    }

    const appendImports = async (imports: IImports[]) => {
        importsStore.addImport(imports)
        return imports
    }

    const removeImports = async (importId: string) => {
        try {
            const res = await importService.delete(importId)

            if (!res) {
                throw new Error('No response from server')
            }

            importsStore.removeImport(importId)

            return res
        } catch (error) {
            return handleError(error, 'Error deleting import')
        }
    }

    const completeImports = async (id: string) => {
        try {
            const res = await importService.complete(id)

            return res
        } catch (error) {
            return handleError(error, 'Error saving import')
        }
    }

    const readPendingTransactions = async (id: string) => {
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
        importsCacheList: importsStore.importsCacheList,
        fetchImports,
        removeImports,
        appendImports,
        completeImports,
        readPendingTransactions,
        editPendingTransaction,
        removePendingTransaction,
        parseTransactionFromFile
    }
}
