'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useError } from '@/hooks/use-error'
import {
    createFinancialAccountBalanceMutation,
    getFinancialAccountBalanceSeriesOptions,
    getFinancialAccountBalanceSeriesQueryKey,
    getFinancialAccountByIdQueryKey,
    getFinancialAccountsQueryKey
} from '@/api/@tanstack/react-query.gen'
import { CreateFinancialAccountBalanceRequest, FinancialAccountBalanceData, FinancialAccountData } from '@poveroh/types'

/**
 * Provides the mutation to record a manual account balance entry.
 * @returns The loading flag and the createAccountBalance submit function.
 */
export const useAccountBalance = () => {
    const queryClient = useQueryClient()
    const { handleError } = useError()

    const [loading, setLoading] = useState(false)

    const balanceSeriesQueryId = getFinancialAccountBalanceSeriesQueryKey({ path: { id: '' } })[0]._id
    const financialAccountByIdQueryId = getFinancialAccountByIdQueryKey({ path: { id: '' } })[0]._id

    const createMutation = useMutation({
        ...createFinancialAccountBalanceMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [{ _id: balanceSeriesQueryId }] })
            queryClient.invalidateQueries({ queryKey: getFinancialAccountsQueryKey() })
            queryClient.invalidateQueries({ queryKey: [{ _id: financialAccountByIdQueryId }] })
        },
        onError: error => {
            handleError(error, 'Error saving balance')
        }
    })

    /**
     * Persists a manual balance entry for a financial account and returns the updated account.
     * @param data The manual balance request payload.
     * @returns The updated financial account, or null on error.
     */
    const createAccountBalance = async (data: CreateFinancialAccountBalanceRequest) => {
        setLoading(true)
        try {
            const response = await createMutation.mutateAsync({ body: data })
            return (response?.data ?? null) as FinancialAccountData | null
        } catch (error) {
            handleError(error, 'Error saving balance')
            return null
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        createAccountBalance
    }
}

/**
 * Reads the balance time-series of a financial account within an optional date range, for the per-account chart.
 * @param accountId The financial account whose series is fetched.
 * @param from An optional inclusive lower bound date (ISO date string).
 * @param to An optional inclusive upper bound date (ISO date string).
 * @returns The TanStack Query result holding the ordered balance points.
 */
export const useAccountBalanceHistory = (accountId: string, from?: string, to?: string) => {
    return useQuery({
        ...getFinancialAccountBalanceSeriesOptions({
            path: { id: accountId },
            query: { from, to }
        }),
        enabled: Boolean(accountId),
        select: response => (response?.data ?? []) as FinancialAccountBalanceData[]
    })
}
