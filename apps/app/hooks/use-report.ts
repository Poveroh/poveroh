'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useError } from '@/hooks/use-error'
import { getTrendReportOptions } from '@/api/@tanstack/react-query.gen'
import { NetWorthEvolutionFilters, NetWorthEvolutionReport } from '@poveroh/types'

export const useReport = () => {
    const { handleError } = useError()
    const queryClient = useQueryClient()

    const [loading, setLoading] = useState(false)

    const getNetWorthEvolution = async (filter?: NetWorthEvolutionFilters): Promise<NetWorthEvolutionReport | null> => {
        setLoading(true)
        try {
            const response = await queryClient.fetchQuery(
                getTrendReportOptions({
                    query: { filter }
                })
            )

            if (!response?.success || !response.data) {
                return null
            }

            return response.data as NetWorthEvolutionReport
        } catch (error) {
            handleError(error, 'Error fetching net worth evolution')
            return null
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        getNetWorthEvolution
    }
}
