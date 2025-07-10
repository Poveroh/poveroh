'use client'

import { useError } from './useError'
import { ImportService } from '@/services/import.service'

export const useImports = () => {
    const { handleError } = useError()

    const importService = new ImportService()

    const editPendingTransaction = async (id: string, data: FormData) => {
        try {
            return await importService.saveTransaction(id, data)
        } catch (error) {
            return handleError(error, 'Error editing transaction')
        }
    }

    const deletePendingTransaction = async (transactionId: string) => {
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
        editPendingTransaction,
        deletePendingTransaction,
        parseTransactionFromFile
    }
}
