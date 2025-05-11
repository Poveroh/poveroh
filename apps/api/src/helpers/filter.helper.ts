export function buildWhere<T extends Record<string, any>>(filters: T): any {
    if (Array.isArray(filters)) return { id: { in: filters } }

    const { search, ...rest } = filters

    const andConditions = Object.entries(rest).map(([key, value]) => {
        if (value === undefined) return null

        if (typeof value === 'object' && value !== null && ('contains' in value || 'equals' in value)) {
            return { [key]: value }
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
