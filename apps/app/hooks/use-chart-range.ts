'use client'

import { useChartRangeStore } from '@/store/chart-range.store'
import { useCallback, useMemo } from 'react'
import { ChartRange, INetWorthEvolutionDataPoint, INetWorthEvolutionFilters } from '@poveroh/types'

type ChartRangeOption = {
    value: ChartRange
    label: string
}

const chartRangeOptions: ChartRangeOption[] = [
    { value: '1D', label: '1D' },
    { value: 'WTD', label: 'WTD' },
    { value: '7D', label: '7D' },
    { value: 'MTD', label: 'MTD' },
    { value: 'LM', label: 'LM' },
    { value: '30D', label: '30D' },
    { value: '90D', label: '90D' },
    { value: 'YTD', label: 'YTD' },
    { value: '365D', label: '365D' },
    { value: '5Y', label: '5Y' },
    { value: '10Y', label: '10Y' },
    { value: 'ALL', label: 'All' }
]

const startOfWeek = (date: Date) => {
    const day = date.getDay()
    const diff = day === 0 ? 6 : day - 1
    const start = new Date(date)
    start.setDate(date.getDate() - diff)
    start.setHours(0, 0, 0, 0)
    return start
}

const startOfMonth = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    start.setHours(0, 0, 0, 0)
    return start
}

const startOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1)
    start.setHours(0, 0, 0, 0)
    return start
}

const addDays = (date: Date, days: number) => {
    const next = new Date(date)
    next.setDate(date.getDate() + days)
    return next
}

const addYears = (date: Date, years: number) => {
    const next = new Date(date)
    next.setFullYear(date.getFullYear() + years)
    return next
}

const getRangeBounds = (range: ChartRange, end: Date) => {
    const endDate = new Date(end)
    endDate.setHours(23, 59, 59, 999)

    if (range === 'ALL') {
        return { start: null, end: null }
    }

    switch (range) {
        case '1D':
            return { start: addDays(endDate, -1), end: endDate }
        case '7D':
            return { start: addDays(endDate, -7), end: endDate }
        case '30D':
            return { start: addDays(endDate, -30), end: endDate }
        case '90D':
            return { start: addDays(endDate, -90), end: endDate }
        case '365D':
            return { start: addDays(endDate, -365), end: endDate }
        case '5Y':
            return { start: addYears(endDate, -5), end: endDate }
        case '10Y':
            return { start: addYears(endDate, -10), end: endDate }
        case 'WTD':
            return { start: startOfWeek(endDate), end: endDate }
        case 'MTD':
            return { start: startOfMonth(endDate), end: endDate }
        case 'YTD':
            return { start: startOfYear(endDate), end: endDate }
        case 'LM': {
            const currentMonthStart = startOfMonth(endDate)
            const lastMonthEnd = addDays(currentMonthStart, -1)
            const lastMonthStart = startOfMonth(lastMonthEnd)
            return { start: lastMonthStart, end: lastMonthEnd }
        }
        default:
            return { start: null, end: null }
    }
}

export const useChartRange = () => {
    const { range, setRange } = useChartRangeStore()

    const options = useMemo(() => chartRangeOptions, [])

    const filterDataPoints = useCallback(
        (dataPoints: INetWorthEvolutionDataPoint[]) => {
            if (!dataPoints.length) return dataPoints

            const latestTimestamp = dataPoints.reduce((max, point) => {
                const ts = new Date(point.date).getTime()
                if (Number.isNaN(ts)) return max
                return Math.max(max, ts)
            }, -Infinity)

            if (!Number.isFinite(latestTimestamp)) {
                return dataPoints
            }

            const endDate = new Date(latestTimestamp)
            const bounds = getRangeBounds(range, endDate)

            if (!bounds.start || !bounds.end) {
                return dataPoints
            }

            return dataPoints.filter(point => {
                const date = new Date(point.date)
                return date >= bounds.start! && date <= bounds.end!
            })
        },
        [range]
    )

    const getRangeFilter = useCallback(
        (endDate?: Date): INetWorthEvolutionFilters | undefined => {
            if (range === 'ALL') {
                return undefined
            }

            const bounds = getRangeBounds(range, endDate ?? new Date())

            if (!bounds.start || !bounds.end) {
                return undefined
            }

            return {
                date: {
                    gte: bounds.start.toISOString(),
                    lte: bounds.end.toISOString()
                }
            }
        },
        [range]
    )

    return {
        range,
        setRange,
        options,
        filterDataPoints,
        getRangeFilter
    }
}
