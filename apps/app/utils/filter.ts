import { DateFilter } from '@poveroh/types'

export const isDateFilter = (value: unknown): value is DateFilter => {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    return 'gte' in value || 'lte' in value
}
