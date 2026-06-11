'use client'

import { useChartRangeStore } from '@/store/chart-range.store'
import { useCallback, useMemo } from 'react'
import { NetWorthEvolution, NetWorthEvolutionFilters } from '@poveroh/types'
import { chartRangeOptions, filterDataPointsByRange, getRangeFilter } from '@/lib/chart-range'

export const useChartRange = () => {
    const { range, setRange } = useChartRangeStore()

    const options = useMemo(() => chartRangeOptions, [])

    const filterDataPoints = useCallback(
        (dataPoints: NetWorthEvolution[]) => filterDataPointsByRange(range, dataPoints),
        [range]
    )

    const buildRangeFilter = useCallback(
        (endDate?: Date): NetWorthEvolutionFilters | undefined => getRangeFilter(range, endDate),
        [range]
    )

    return {
        range,
        setRange,
        options,
        filterDataPoints,
        getRangeFilter: buildRangeFilter
    }
}
