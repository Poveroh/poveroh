import { Prisma } from '@prisma/client'

/**
 * Recursively converts every Prisma.Decimal instance found in a query result into a JS number.
 * @param value The value returned by a Prisma query (row, array of rows, or nested relation).
 * @returns The same value with all Decimal instances replaced by numbers.
 */
function convertDecimals(value: unknown): unknown {
    if (value instanceof Prisma.Decimal) {
        return value.toNumber()
    }

    if (Array.isArray(value)) {
        return value.map(convertDecimals)
    }

    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, convertDecimals(entry)]))
    }

    return value
}

/**
 * Prisma Client extension that converts every Decimal field on every query result to a JS number,
 * so callers always receive numbers instead of Decimal.js instances or strings.
 */
export const decimalToNumberExtension = Prisma.defineExtension({
    name: 'decimalToNumber',
    query: {
        $allModels: {
            async $allOperations({ query, args }) {
                const result = await query(args)
                return convertDecimals(result)
            }
        }
    }
})
