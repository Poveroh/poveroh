'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { IMPORT_PROCESSING_POLL_INTERVAL, ImportData, ImportFilters } from '@poveroh/types'
import { useError } from './use-error'
import {
    completeImportMutation,
    createImportMutation,
    createImportTemplateMutation,
    deleteImportMutation,
    deleteImportsMutation,
    getImportsOptions,
    getImportsQueryKey,
    rollbackImportMutation
} from '@/api/@tanstack/react-query.gen'
import { useFilters } from './use-filters'

export const useImport = () => {
    const queryClient = useQueryClient()
    const { handleError } = useError()

    const filters = useFilters<ImportFilters>(
        text => ({
            title: { contains: text }
        }),
        { includeTransactions: false }
    )

    const importQuery = useQuery({
        ...getImportsOptions(filters.activeFilters ? { query: { filter: filters.activeFilters } } : undefined),
        refetchInterval: query =>
            query.state.data?.data?.some(item => item.status === 'PROCESSING')
                ? IMPORT_PROCESSING_POLL_INTERVAL
                : false,
        staleTime: Infinity
    })

    const importData: ImportData[] = importQuery.data?.data ?? []

    const invalidateImports = () => queryClient.invalidateQueries({ queryKey: getImportsQueryKey() })

    const createImport = useMutation({
        ...createImportMutation(),
        onSuccess: () => {
            invalidateImports()
        },
        onError: error => {
            handleError(error, 'Error parsing transaction from file')
        }
    })

    const deleteImport = useMutation({
        ...deleteImportMutation(),
        onSuccess: () => {
            invalidateImports()
        },
        onError: error => {
            handleError(error, 'Error deleting import')
        }
    })

    const deleteAllMutation = useMutation({
        ...deleteImportsMutation(),
        onSuccess: () => {
            invalidateImports()
        },
        onError: error => {
            handleError(error, 'Error deleting all imports')
        }
    })

    const completeImport = useMutation({
        ...completeImportMutation(),
        onSuccess: () => {
            invalidateImports()
        },
        onError: error => {
            handleError(error, 'Error saving import')
        }
    })

    const rollbackImport = useMutation({
        ...rollbackImportMutation(),
        onSuccess: () => {
            invalidateImports()
        },
        onError: error => {
            handleError(error, 'Error rolling back import')
        }
    })

    const importTemplate = useMutation({
        ...createImportTemplateMutation(),
        onError: error => {
            handleError(error, 'Error importing template')
        }
    })

    return {
        filters,
        importQuery,
        importData,
        createImport,
        deleteImport,
        deleteAllMutation,
        completeImport,
        rollbackImport,
        importTemplate,
        invalidateImports
    }
}
