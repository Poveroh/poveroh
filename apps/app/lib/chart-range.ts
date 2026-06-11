import { ChartRange, NetWorthEvolutionFilters } from '@poveroh/types'

export type ChartRangeOption = {
    value: ChartRange
    label: string
}

export const chartRangeOptions: ChartRangeOption[] = [
    { value: '1D', label: '1D' },
    { value: 'WTD', label: 'WTD' },
    { value: '7D', label: '7D' },
    { value: 'MTD', label: 'MTD' },
    { value: 'LM', label: 'LM' },
    { value: '30D', label: '30D' },
    { value: '90D', label: '90D' },
    { value: '180D', label: '180D' },
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

/**
 * Computes the inclusive date bounds for a chart range relative to an end date.
 * @param range The selected chart range.
 * @param end The reference end date the range is measured back from.
 * @returns The start and end bounds, both null when the range spans all time.
 */
export const getRangeBounds = (range: ChartRange, end: Date): { start: Date | null; end: Date | null } => {
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
        case '180D':
            return { start: addDays(endDate, -180), end: endDate }
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

/**
 * Filters a list of net-worth evolution points to those falling within the selected range.
 * @param range The selected chart range.
 * @param dataPoints The evolution points to filter.
 * @returns The points within the range, or all points when the range spans all time.
 */
export const filterDataPointsByRange = <T extends { date: string }>(range: ChartRange, dataPoints: T[]): T[] => {
    if (!dataPoints.length) return dataPoints

    const latestTimestamp = dataPoints.reduce((max, point) => {
        const ts = new Date(point.date).getTime()
        if (Number.isNaN(ts)) return max
        return Math.max(max, ts)
    }, -Infinity)

    if (!Number.isFinite(latestTimestamp)) {
        return dataPoints
    }

    const bounds = getRangeBounds(range, new Date(latestTimestamp))

    if (!bounds.start || !bounds.end) {
        return dataPoints
    }

    return dataPoints.filter(point => {
        const date = new Date(point.date)
        return date >= bounds.start! && date <= bounds.end!
    })
}

/**
 * Builds the date filter sent to the API for a chart range, returning undefined for the all-time range.
 * @param range The selected chart range.
 * @param endDate The reference end date; defaults to now.
 * @returns The date filter for the range, or undefined when the range spans all time.
 */
export const getRangeFilter = (range: ChartRange, endDate?: Date): NetWorthEvolutionFilters | undefined => {
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
}
