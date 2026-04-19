/**
 * Returns the current date and time as an ISO string.
 *
 * @returns The current date and time as an ISO string.
 */
export function nowAsISOString() {
    return new Date().toISOString()
}

/**
 * Converts a string value to a boolean. Recognizes "true", "1", "yes", and "on" (case-insensitive) as true.
 * @param value - The value to convert to boolean.
 * @returns  True if the value is recognized as a true value, false otherwise.
 */
export function toBoolean(value: string): boolean {
    if (typeof value !== 'string') return false

    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase())
}
