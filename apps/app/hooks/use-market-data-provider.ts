'use client'

import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'

import {
    deleteMarketDataProviderCredentialMutation,
    getMarketDataProvidersOptions,
    getMarketDataProvidersQueryKey,
    saveMarketDataProviderCredentialMutation
} from '@/api/@tanstack/react-query.gen'

import { useError } from './use-error'

// Hook centralizing the queries and mutations needed by the market data providers
// settings page: list providers (with per-user `configured` flag), save and delete credentials.
export const useMarketDataProvider = () => {
    const queryClient = useQueryClient()
    const { handleError } = useError()

    const [providersQuery] = useQueries({
        queries: [
            {
                ...getMarketDataProvidersOptions(),
                staleTime: 30 * 1000
            }
        ]
    })

    const saveCredentialMutation = useMutation({
        ...saveMarketDataProviderCredentialMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getMarketDataProvidersQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error saving provider credential')
        }
    })

    const deleteCredentialMutation = useMutation({
        ...deleteMarketDataProviderCredentialMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getMarketDataProvidersQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting provider credential')
        }
    })

    const providers = providersQuery.data?.data ?? []

    return {
        providersQuery,
        providers,
        saveCredentialMutation,
        deleteCredentialMutation
    }
}
