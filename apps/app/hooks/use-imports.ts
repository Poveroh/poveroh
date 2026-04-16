'use client'

import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { ImportFilters } from '@poveroh/types'
import { useError } from './use-error'
import {
    completeImportMutation,
    createImportMutation,
    createImportTemplateMutation,
    deleteImportMutation,
    deleteImportsMutation,
    getImportsOptions,
    getImportsQueryKey
} from '@/api/@tanstack/react-query.gen'
import { useFilters } from './use-filters'

export const useImport = () => {
    const queryClient = useQueryClient()
    const { handleError } = useError()

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

    const importTemplate = useMutation({
        ...createImportTemplateMutation(),
        onError: error => {
            handleError(error, 'Error importing template')
        }
    })

    return {
        filters,
        importQuery,
        importData: importQuery.data?.data ?? [],
        createImport,
        deleteImport,
        deleteAllMutation,
        completeImport,
        importTemplate,
        invalidateImports
    }
}
