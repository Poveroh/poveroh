'use client'

import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { useError } from './use-error'
import {
    createFinancialAccountMutation,
    deleteFinancialAccountMutation,
    deleteFinancialAccountsMutation,
    getFinancialAccountByIdOptions,
    getFinancialAccountByIdQueryKey,
    getFinancialAccountsOptions,
    getFinancialAccountsQueryKey,
    updateFinancialAccountMutation
} from '@/api/@tanstack/react-query.gen'
import { ACCOUNT_TYPE_CATALOG, FinancialAccountData, FinancialAccountFilters } from '@poveroh/types'
import { useUtils } from './use-utils'
import { useMemo } from 'react'
import { useFilters } from './use-filters'

export const useFinancialAccount = () => {
    const queryClient = useQueryClient()
    const { renderItemsLabel } = useUtils()
    const { handleError } = useError()

    const filters = useFilters<FinancialAccountFilters>(text => ({
        title: { contains: text }
    }))

    const [accountQuery] = useQueries({
        queries: [
            {
                ...getFinancialAccountsOptions(
                    filters.activeFilters ? { query: { filter: filters.activeFilters } } : undefined
                ),
                staleTime: Infinity
            }
        ]
    })

    const createMutation = useMutation({
        ...createFinancialAccountMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getFinancialAccountsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error creating financial account')
        }
    })

    const updateMutation = useMutation({
        ...updateFinancialAccountMutation(),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: getFinancialAccountsQueryKey() })
            queryClient.invalidateQueries({
                queryKey: getFinancialAccountByIdQueryKey({
                    path: { id: variables.path.id }
                })
            })
        },
        onError: error => {
            handleError(error, 'Error updating financial account')
        }
    })

    const deleteMutation = useMutation({
        ...deleteFinancialAccountMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getFinancialAccountsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting financial account')
        }
    })

    const deleteAllMutation = useMutation({
        ...deleteFinancialAccountsMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getFinancialAccountsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting all financial accounts')
        }
    })

    const getFinancialAccountById = async (financialAccountId: string) => {
        try {
            const response = await queryClient.fetchQuery(
                getFinancialAccountByIdOptions({
                    path: { id: financialAccountId }
                })
            )

            if (!response?.success) return null

            return (response?.data ?? null) as FinancialAccountData | null
        } catch (error) {
            return handleError(error, 'Error fetching financial account')
        }
    }

    return {
        ...filters,
        accountQuery,
        createMutation,
        updateMutation,
        deleteMutation,
        deleteAllMutation,
        getFinancialAccountById,
        ACCOUNT_TYPE_CATALOG: useMemo(() => renderItemsLabel(ACCOUNT_TYPE_CATALOG), [])
    }
}
