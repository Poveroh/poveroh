import { useState, useCallback } from 'react'
import { IFilterOptions } from '@poveroh/types'

interface UseTransactionFiltersProps {
    initialSkip?: number
    initialTake?: number
    onFilterChange?: (filters: IFilterOptions, append?: boolean) => Promise<void>
}

export const useTransactionFilters = ({
    initialSkip = 0,
    initialTake = 20,
    onFilterChange
}: UseTransactionFiltersProps) => {
    const [filters, setFilters] = useState<IFilterOptions>({
        skip: initialSkip,
        take: initialTake
    })

    const [isLoading, setIsLoading] = useState(false)

    const loadMore = useCallback(async () => {
        if (!onFilterChange || isLoading) return

        setIsLoading(true)

        try {
            const currentSkip = filters.skip ?? 0
            const currentTake = filters.take ?? 20

            const newFilters = {
                ...filters,
                skip: currentSkip + currentTake,
                take: currentTake
            }

            await onFilterChange(newFilters, true)
            setFilters(newFilters)
        } catch (error) {
            console.error('Error loading more transactions:', error)
        } finally {
            setIsLoading(false)
        }
    }, [filters, onFilterChange, isLoading])

    const refresh = useCallback(async () => {
        if (!onFilterChange || isLoading) return

        setIsLoading(true)

        try {
            await onFilterChange(filters, false)
        } catch (error) {
            console.error('Error refreshing transactions:', error)
        } finally {
            setIsLoading(false)
        }
    }, [filters, onFilterChange, isLoading])

    const updateFilters = useCallback((newFilters: Partial<IFilterOptions>) => {
        setFilters(prev => ({ ...prev, ...newFilters }))
    }, [])

    return {
        filters,
        isLoading,
        loadMore,
        refresh,
        updateFilters
    }
}
