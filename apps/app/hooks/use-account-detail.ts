'use client'

import { useQuery } from '@tanstack/react-query'

import { getFinancialAccountByIdOptions } from '@/api/@tanstack/react-query.gen'
import { useFinancialAccount } from '@/hooks/use-account'
import { FinancialAccountData } from '@poveroh/types'

/**
 * Reads a single financial account by id and exposes the account mutations for the detail page.
 * @param id The financial account id to read.
 * @returns The account, its query loading flags and refetch, and the delete mutation.
 */
export const useAccountDetail = (id: string) => {
    const { deleteMutation } = useFinancialAccount()

    const accountQuery = useQuery({
        ...getFinancialAccountByIdOptions({ path: { id } }),
        select: response => (response?.data ?? null) as FinancialAccountData | null
    })

    return {
        account: accountQuery.data ?? null,
        isLoading: accountQuery.isLoading,
        isFetching: accountQuery.isFetching,
        refetch: accountQuery.refetch,
        deleteMutation
    }
}
