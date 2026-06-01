'use client'

import { useQueryClient } from '@tanstack/react-query'

import type { MarketQuote } from '@poveroh/types'
import { getMarketQuotesOptions } from '@/api/@tanstack/react-query.gen'

import { useError } from './use-error'

export const useMarketQuote = () => {
    const queryClient = useQueryClient()
    const { handleError } = useError()

    /**
     * Fetches the current quote for a single symbol on demand.
     * @param symbol The instrument symbol to quote.
     * @param providerId Optional provider override; defaults to the user's preferred provider.
     * @returns The normalized quote, or null when unavailable.
     */
    const fetchQuote = async (symbol: string, providerId?: string): Promise<MarketQuote | null> => {
        try {
            const response = await queryClient.fetchQuery(
                getMarketQuotesOptions({ query: { symbols: [symbol], providerId } })
            )

            if (!response?.success) return null

            return response.data?.[0] ?? null
        } catch (error) {
            handleError(error, 'Error fetching market quote')
            return null
        }
    }

    return { fetchQuote }
}
