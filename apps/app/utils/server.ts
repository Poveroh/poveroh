import { IFilterOptions } from '@poveroh/types/dist'
import qs from 'qs'

export function buildFilters<F = unknown>(filters?: F, options?: IFilterOptions) {
    const queryObject: Record<string, unknown> = {}

    if (filters) queryObject.filter = filters
    if (options) queryObject.options = options

    return qs.stringify(queryObject, { encode: true, indices: false })
}
