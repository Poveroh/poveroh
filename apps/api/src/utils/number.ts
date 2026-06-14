import { Prisma } from '@prisma/client'

/**
 * Converts a Prisma Decimal to a plain number; returns null if the input is null/undefined.
 * @param value The value to convert.
 * @returns A number or null if the input is null/undefined.
 */
export function toNumber(value: Prisma.Decimal | number | string | null | undefined): number | null {
    if (value == null) return null
    return typeof value === 'object' && 'toNumber' in value ? value.toNumber() : Number(value)
}
