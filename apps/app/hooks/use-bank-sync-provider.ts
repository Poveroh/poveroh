'use client'

import type { ChangeEvent } from 'react'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getBankSyncProvidersOptions } from '@/api/@tanstack/react-query.gen'

/**
 * Fetches bank-sync providers and exposes a locally filtered, searchable view of them.
 * @returns The providers query and data, plus the search state and handler.
 */
export const useBankSyncProvider = () => {
    const [searchText, setSearchText] = useState('')

    const providersQuery = useQuery({
        ...getBankSyncProvidersOptions(),
        staleTime: 30 * 1000
    })

    const providers = providersQuery.data?.data ?? []

    const onSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value)
    }

    const filteredProviders = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase()
        if (!normalizedSearch) return providers

        return providers.filter(provider => provider.label.toLowerCase().includes(normalizedSearch))
    }, [providers, searchText])

    return {
        providersQuery,
        providers,
        filteredProviders,
        searchText,
        onSearch
    }
}
