import type { FilterOptions } from '@/lib/api-client'
import qs from 'qs'

export function buildFilters<F = unknown>(filters?: F, options?: FilterOptions) {
    const queryObject: Record<string, unknown> = {}

    if (filters) queryObject.filter = filters
    if (options) queryObject.options = options

    return qs.stringify(queryObject, { encode: true, indices: false })
}
