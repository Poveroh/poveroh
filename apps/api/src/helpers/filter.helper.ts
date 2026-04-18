type GenericFilter = Record<string, any>

export function buildWhere<T extends GenericFilter>(filters: T, orKeys: (keyof T)[]) {
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
