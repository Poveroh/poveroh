'use client'

import { useIsFetching, useMutation, useQueryClient } from '@tanstack/react-query'
import { LoadingState } from '@/types/general'
import { useFinancialAccountStore } from '@/store/account.store'
import { useTranslations } from 'next-intl'
import { useError } from './use-error'
import {
    createFinancialAccountMutation,
    deleteFinancialAccountMutation,
    getFinancialAccountByIdOptions,
    getFinancialAccountByIdQueryKey,
    getFinancialAccountsOptions,
    getFinancialAccountsQueryKey,
    updateFinancialAccountMutation
} from '@/api/@tanstack/react-query.gen'
import { FinancialAccountData } from '@poveroh/types'

export const useFinancialAccount = () => {
    const queryClient = useQueryClient()
    const t = useTranslations()
    const { handleError } = useError()
    const financialAccountStore = useFinancialAccountStore()

    const createMutation = useMutation({
        ...createFinancialAccountMutation(),
        onSuccess: data => {
            const financialAccount = data?.data as FinancialAccountData | undefined
            if (financialAccount) {
                financialAccountStore.addFinancialAccount(financialAccount)
            }
            queryClient.invalidateQueries({ queryKey: getFinancialAccountsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error creating financial account')
        }
    })

    const updateMutation = useMutation({
        ...updateFinancialAccountMutation(),
        onSuccess: (data, variables) => {
            const financialAccount = (data?.data ?? variables.body) as FinancialAccountData | undefined
            if (financialAccount) {
                financialAccountStore.editFinancialAccount(financialAccount)
            }

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
        onSuccess: (_, variables) => {
            financialAccountStore.removeFinancialAccount(variables.path.id)
            queryClient.invalidateQueries({ queryKey: getFinancialAccountsQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting financial account')
        }
    })

    const fetchFinancialAccounts = async () => {
        try {
            const response = await queryClient.fetchQuery(getFinancialAccountsOptions())

            if (!response?.success) return []

            return (response?.data ?? []) as FinancialAccountData[]
        } catch (error) {
            return handleError(error, 'Error fetching financial accounts')
        }
    }

    const getFinancialAccount = async (financialAccountId: string) => {
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

    const financialAccountLoading: LoadingState = {
        create: createMutation.isPending,
        update: updateMutation.isPending,
        delete: deleteMutation.isPending,
        fetch: useIsFetching({ queryKey: getFinancialAccountsQueryKey() }) > 0,
        get:
            useIsFetching({
                predicate: query => {
                    const key = query.queryKey?.[0] as { _id?: string } | undefined
                    return key?._id === 'getFinancialAccountById'
                }
            }) > 0
    }

    const TYPE_LIST = [
        { value: 'ONLINE_BANK', label: t('accounts.types.online') },
        { value: 'BANK_ACCOUNT', label: t('accounts.types.bank') },
        { value: 'CIRCUIT', label: t('accounts.types.circuit') },
        { value: 'DEPOSIT_BANK', label: t('accounts.types.deposit') },
        { value: 'BROKER', label: t('accounts.types.broker') }
    ]

    return {
        financialAccountCacheList: financialAccountStore.financialAccountCacheList,
        financialAccountLoading,
        createFinancialAccount: createMutation.mutateAsync,
        updateFinancialAccount: updateMutation.mutateAsync,
        deleteFinancialAccount: deleteMutation.mutateAsync,
        getFinancialAccount,
        fetchFinancialAccounts,
        TYPE_LIST
    }
}
