'use client'

import { useCallback, useMemo, useState } from 'react'
import { ChartRange, NetWorthEvolution, NetWorthEvolutionFilters } from '@poveroh/types'
import { chartRangeOptions, filterDataPointsByRange, getRangeFilter } from '@/lib/chart-range'

/**
 * Holds the chart range in local component state (not the shared persisted store), so a page can drive its own
 * range without affecting the dashboard. Mirrors the API of useChartRange.
 * @param initial The initial range value.
 * @param allowed An optional subset of ranges to expose as selectable options; defaults to all ranges.
 * @returns The current range, a setter, the selectable options, and the range filter/data-point helpers.
 */
export const useLocalChartRange = (initial: ChartRange = '30D', allowed?: ChartRange[]) => {
    const [range, setRange] = useState<ChartRange>(initial)

    const options = useMemo(
        () => (allowed ? chartRangeOptions.filter(option => allowed.includes(option.value)) : chartRangeOptions),
        [allowed]
    )

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
