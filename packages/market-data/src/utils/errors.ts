import { MarketDataError } from '@poveroh/types'

/**
 * Reads an HTTP status code from an axios-style error (`error.response.status`).
 * @param error The thrown value.
 * @returns The status code when present, otherwise undefined.
 */
function extractStatusCode(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null) return undefined

    const response = (error as { response?: unknown }).response
    if (typeof response !== 'object' || response === null) return undefined

    const status = (response as { status?: unknown }).status
    return typeof status === 'number' ? status : undefined
}

/**
 * Normalizes any thrown value into a MarketDataError, preserving the upstream HTTP
 * status when the underlying error exposes one so callers can react to 4xx vs 5xx.
 * @param providerId The provider the error originated from.
 * @param error The thrown value.
 * @returns A MarketDataError tagged with the provider and status when available.
 */
export function toMarketDataError(providerId: string, error: unknown): MarketDataError {
    if (error instanceof MarketDataError) return error

    const message = error instanceof Error ? error.message : 'Unknown provider error'
    return new MarketDataError(providerId, message, extractStatusCode(error))
}
