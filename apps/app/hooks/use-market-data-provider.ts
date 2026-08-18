'use client'

import type { ChangeEvent } from 'react'
import { useMemo, useState } from 'react'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'

import {
    deleteMarketDataProviderCredentialMutation,
    getMarketDataProvidersOptions,
    getMarketDataProvidersQueryKey,
    saveMarketDataProviderCredentialMutation
} from '@/api/@tanstack/react-query.gen'

import { useError } from './use-error'

/**
 * Fetches market data providers and exposes credential-related mutations plus a locally filtered, searchable view of providers requiring credentials.
 * @returns The providers query and data, the search state and handler, the credential-requiring providers filtered by search, and the credential save/delete mutations.
 */
export const useMarketDataProvider = () => {
    const queryClient = useQueryClient()
    const { handleError } = useError()

    const [searchText, setSearchText] = useState('')

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

    const onSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value)
    }

    const credentialProviders = useMemo(() => providers.filter(provider => provider.requiresCredentials), [providers])

    const filteredCredentialProviders = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase()

        if (!normalizedSearch) return credentialProviders

        return credentialProviders.filter(provider => provider.label.toLowerCase().includes(normalizedSearch))
    }, [credentialProviders, searchText])

    return {
        providersQuery,
        providers,
        credentialProviders,
        filteredCredentialProviders,
        searchText,
        onSearch,
        saveCredentialMutation,
        deleteCredentialMutation
    }
}
