import type { BankSyncAdapter, BankSyncCredentialInput, BankSyncWebhookEvent } from '@poveroh/types'
import { BankSyncError } from '@poveroh/types'
import { PlaidAdapter, parsePlaidWebhook } from './adapters/plaid.adapter'
import { LunchFlowAdapter, parseLunchFlowWebhook } from './adapters/lunchflow.adapter'

/**
 * Asserts an app-level credential is present, throwing a provider-scoped error when it is missing.
 * @param providerId The bank-sync provider identifier.
 * @param key The name of the missing credential field, matching the provider's registered `appCredentialFields` key.
 * @param value The credential value to check.
 * @returns The credential value, guaranteed to be defined.
 */
function requireAppCredential(providerId: string, key: string, value: string | undefined): string {
    if (!value) {
        throw new BankSyncError(providerId, `Provider "${providerId}" is missing app-level credential "${key}"`)
    }
    return value
}

/**
 * Factory that returns the adapter for a provider id. Adding a provider is a single case here
 * plus a new adapter file; callers keep using the common BankSyncAdapter interface.
 * @param providerId The bank-sync provider identifier.
 * @param appCredentials The user-supplied app-level credentials for this provider (e.g. a Plaid
 * client id/secret), keyed exactly like the provider's registered `appCredentialFields`. Poveroh
 * never ships with any provider's own app credentials — the self-hosted instance owner enters
 * them, and the caller decrypts/passes them in per call.
 * @returns An adapter implementing the common interface.
 */
export function createBankSyncClient(
    providerId: string,
    appCredentials: BankSyncCredentialInput = {}
): BankSyncAdapter {
    switch (providerId) {
        case 'plaid':
            return new PlaidAdapter(
                requireAppCredential(providerId, 'clientId', appCredentials.clientId),
                requireAppCredential(providerId, 'secret', appCredentials.secret),
                appCredentials.env || 'sandbox'
            )
        case 'lunchflow':
            return new LunchFlowAdapter(requireAppCredential(providerId, 'apiKey', appCredentials.apiKey))
        default:
            throw new BankSyncError(providerId, `Unknown bank-sync provider: ${providerId}`)
    }
}

/**
 * Resolves a raw webhook payload to the connection it concerns, without needing any app-level
 * credentials — a webhook carries no session, so the caller doesn't yet know which user (and
 * therefore whose app credentials) it belongs to; that lookup only happens after this resolves
 * the provider's own connection id.
 * @param providerId The provider the webhook came from.
 * @param payload The raw webhook body.
 * @param headers The raw webhook request headers.
 * @returns The resolved webhook event, or null if the provider is unknown or the payload isn't recognizable.
 */
export function parseBankSyncWebhook(
    providerId: string,
    payload: unknown,
    headers: Record<string, string>
): BankSyncWebhookEvent | null {
    switch (providerId) {
        case 'plaid':
            return parsePlaidWebhook(payload)
        case 'lunchflow':
            return parseLunchFlowWebhook(payload)
        default:
            return null
    }
}
