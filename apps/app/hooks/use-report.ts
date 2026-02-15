'use client'

import { useState } from 'react'
import { useError } from '@/hooks/use-error'
import { INetWorthEvolutionFilters } from '@poveroh/types/dist'
import { ReportService } from '@/services/report.service'

export const useReport = () => {
    const { handleError } = useError()
    const reportService = new ReportService()

    const [loading, setLoading] = useState(false)

    const getNetWorthEvolution = async (filter?: INetWorthEvolutionFilters) => {
        setLoading(true)
        try {
            return await reportService.getNetWorthEvolution(filter)
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
