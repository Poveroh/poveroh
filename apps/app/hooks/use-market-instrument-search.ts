'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import type { AssetTypeEnum, MarketInstrument } from '@poveroh/types'
import { MARKET_DATA_SEARCH_DEFAULT_LIMIT, MARKET_DATA_SEARCH_MIN_QUERY_LENGTH } from '@poveroh/types'
import { searchMarketInstrumentsOptions } from '@/api/@tanstack/react-query.gen'

import { useDebounce } from './use-debounce'

type UseMarketInstrumentSearchProps = {
    providerId?: string
    assetType?: AssetTypeEnum
    limit?: number
}

export const useMarketInstrumentSearch = ({
    providerId,
    assetType,
    limit = MARKET_DATA_SEARCH_DEFAULT_LIMIT
}: UseMarketInstrumentSearchProps = {}) => {
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query)
    const trimmedQuery = debouncedQuery.trim()
    const enabled = trimmedQuery.length >= MARKET_DATA_SEARCH_MIN_QUERY_LENGTH

    const searchQuery = useQuery({
        ...searchMarketInstrumentsOptions({
            query: { q: trimmedQuery, providerId, assetType, limit }
        }),
        enabled,
        staleTime: 30 * 1000
    })

    const instruments: MarketInstrument[] = enabled ? (searchQuery.data?.data ?? []) : []

    return {
        query,
        setQuery,
        instruments,
        isFetching: enabled && searchQuery.isFetching,
        isError: searchQuery.isError,
        minQueryLength: MARKET_DATA_SEARCH_MIN_QUERY_LENGTH
    }
}
