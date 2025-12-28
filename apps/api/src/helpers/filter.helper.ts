export function buildWhere<T extends Record<string, any>>(filters: T): any {
    if (Array.isArray(filters)) return { id: { in: filters } }

    const { search, ...rest } = filters

    const andConditions = Object.entries(rest).map(([key, value]) => {
        if (value === undefined) return null

        if (typeof value === 'object' && value !== null) {
            // Handle date filters with gte/lte
            if ('gte' in value || 'lte' in value) {
                const dateFilter: any = {}
                if (value.gte) dateFilter.gte = new Date(value.gte)
                if (value.lte) dateFilter.lte = new Date(value.lte)
                return { [key]: dateFilter }
            }

            // Handle string filters with contains/equals
            if ('contains' in value || 'equals' in value) {
                return { [key]: value }
            }
        }

        return { [key]: value }
    })

    const searchConditions =
        search && typeof search === 'string'
            ? {
                  OR: [
                      { title: { contains: search, mode: 'insensitive' } },
                      { description: { contains: search, mode: 'insensitive' } },
                      { note: { contains: search, mode: 'insensitive' } }
                  ]
              }
            : {}

    return {
        AND: [...andConditions.filter(Boolean), searchConditions]
    }
}
