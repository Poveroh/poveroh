export function buildWhere<T extends Record<string, any>>(filters: T): any {
    if (Array.isArray(filters)) return { id: { in: filters } }

    const andConditions = Object.entries(filters).map(([key, value]) => {
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

    return Object.assign({}, ...andConditions.filter(Boolean))
}

type GenericFilter = Record<string, any>

export function buildWhere2<T extends GenericFilter>(filters: T, orKeys: (keyof T)[]) {
    const andConditions: any[] = []
    const orConditions: any[] = []

    for (const key in filters) {
        const value = filters[key]
        if (value === undefined) continue

        const isStringFilter =
            typeof value === 'object' &&
            value !== null &&
            ('contains' in value || 'startsWith' in value || 'endsWith' in value)

        const condition = isStringFilter ? { [key]: { ...value, mode: 'insensitive' } } : { [key]: value }

        if (orKeys.includes(key)) {
            orConditions.push(condition)
        } else {
            andConditions.push(condition)
        }
    }

    const where: any = {}

    if (andConditions.length > 0) {
        where.AND = andConditions
    }

    if (orConditions.length > 0) {
        where.OR = orConditions
    }

    return where
}
