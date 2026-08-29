import { BankSyncError } from '@poveroh/types'

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
 * Reads the provider's own error description out of an axios-style error response body
 * (`error.response.data`), trying the field names providers commonly use for it. Without this,
 * only axios's generic "Request failed with status code 4xx" survives, which discards the actual
 * reason (e.g. Plaid's `error_code`/`error_message`) that the caller needs to diagnose the failure.
 * @param error The thrown value.
 * @returns The provider's error description when present, otherwise undefined.
 */
function extractProviderMessage(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null) return undefined

    const response = (error as { response?: unknown }).response
    if (typeof response !== 'object' || response === null) return undefined

    const data = (response as { data?: unknown }).data
    if (typeof data !== 'object' || data === null) return undefined

    const candidate = data as { error_message?: unknown; display_message?: unknown; message?: unknown }
    if (typeof candidate.error_message === 'string') return candidate.error_message
    if (typeof candidate.display_message === 'string') return candidate.display_message
    if (typeof candidate.message === 'string') return candidate.message
    return undefined
}

/**
 * Normalizes any thrown value into a BankSyncError, preserving the upstream HTTP
 * status when the underlying error exposes one so callers can react to 4xx vs 5xx.
 * @param providerId The provider the error originated from.
 * @param error The thrown value.
 * @returns A BankSyncError tagged with the provider and status when available.
 */
export function toBankSyncError(providerId: string, error: unknown): BankSyncError {
    if (error instanceof BankSyncError) return error

    const message = extractProviderMessage(error) ?? (error instanceof Error ? error.message : 'Unknown provider error')
    return new BankSyncError(providerId, message, extractStatusCode(error))
}
