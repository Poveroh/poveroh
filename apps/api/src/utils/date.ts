/**
 * Normalizes a date to midnight UTC so each balance point maps to a single calendar day.
 * @param date The date to normalize.
 * @returns A new Date set to 00:00:00.000 UTC of the same calendar day.
 */
export function normalizeDate(payload: Date | string): Date {
    const date = typeof payload === 'string' ? new Date(payload) : payload

    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

/**
 * Converts a date string to a Date object.
 * @param date The date string to convert.
 * @returns A new Date object representing the same point in time.
 */
export function toDate(date: string): Date {
    return new Date(date)
}

/**
 * Returns the UTC day offset from the given date by a number of days, normalized to midnight UTC.
 * @param date The reference date.
 * @param days The number of days to add (negative to subtract).
 * @returns A new Date at 00:00:00.000 UTC of the offset calendar day.
 */
export function addUtcDays(date: Date, days: number): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days))
}

/**
 * Normalizes nullable dates into ISO strings so API responses stay stable.
 * @param value The date to normalize.
 * @returns An ISO string or null if the input is null/undefined.
 */
export function toIsoString(value: Date | string | null | undefined): string | null {
    if (!value) return null
    return value instanceof Date ? value.toISOString() : value
}
