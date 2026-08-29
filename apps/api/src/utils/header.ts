import type { Request } from 'express'

/**
 * Flattens Express request headers into a plain string map, taking the first value for any
 * header that was sent multiple times.
 * @param headers The raw Express request headers.
 * @returns A map of header name to its first string value.
 */
export function flattenHeaders(headers: Request['headers']): Record<string, string> {
    return Object.fromEntries(
        Object.entries(headers).map(([key, value]) => [key, Array.isArray(value) ? (value[0] ?? '') : (value ?? '')])
    )
}
