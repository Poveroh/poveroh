import type {
    BankSyncAdapter,
    BankSyncCredentialInput,
    BankSyncWebhookEvent,
    CompleteConnectionResult,
    BankSyncExternalAccount,
    ExternalTransaction,
    InitiateConnectionResult,
    PlaidLinkOnSuccessMetadata,
    SyncTransactionsResult,
    CurrencyEnum
} from '@poveroh/types'
import { BankSyncError } from '@poveroh/types'
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid'
import type { RemovedTransaction, Transaction as PlaidTransaction } from 'plaid'
import { toBankSyncError } from '../utils/errors'
import { stripQueryString } from '../utils/query'
import { requireAccessToken } from '../utils/token'

/**
 * Plaid adapter. Uses the official `plaid` SDK with app-level client id/secret from env; the
 * user's own `access_token` is passed in per-call, never held on the instance.
 */
export class PlaidAdapter implements BankSyncAdapter {
    readonly providerId = 'plaid'
    private readonly client: PlaidApi

    constructor(clientId: string, clientSecret: string, env: string) {
        this.client = new PlaidApi(
            new Configuration({
                basePath: PlaidEnvironments[env] ?? PlaidEnvironments.sandbox,
                baseOptions: {
                    headers: {
                        'PLAID-CLIENT-ID': clientId,
                        'PLAID-SECRET': clientSecret
                    }
                }
            })
        )
    }

    /**
     * Creates a Plaid Link token for the user, opened client-side by the Plaid Link widget.
     * @param params The user starting the connection and the redirect URI Plaid should honor.
     * @returns The hosted-flow result carrying the opaque link token.
     */
    async initiateConnection(params: { userId: string; redirectUri: string }): Promise<InitiateConnectionResult> {
        try {
            const response = await this.client.linkTokenCreate({
                user: { client_user_id: params.userId },
                client_name: 'Poveroh',
                products: [Products.Transactions],
                country_codes: [
                    CountryCode.Us,
                    CountryCode.Gb,
                    CountryCode.Es,
                    CountryCode.Fr,
                    CountryCode.It,
                    CountryCode.De
                ],
                language: 'en',
                redirect_uri: stripQueryString(params.redirectUri)
            })

            return { flow: 'hosted', connectUrl: response.data.link_token }
        } catch (error) {
            throw toBankSyncError(this.providerId, error)
        }
    }

    /**
     * Exchanges the Plaid Link `public_token` for a durable `access_token`/`item_id`.
     * @param params The callback payload carrying the `publicToken` from Plaid Link's `onSuccess`.
     * @returns The linked connection identity and the plaintext secret to encrypt and persist.
     */
    async completeConnection(params: {
        callbackPayload?: Record<string, string>
        metadata?: Record<string, string>
    }): Promise<CompleteConnectionResult> {
        const payloadMetadata = params.metadata as unknown as PlaidLinkOnSuccessMetadata | undefined

        const publicToken = params.callbackPayload?.publicToken
        if (!publicToken) throw new BankSyncError(this.providerId, 'Missing Plaid public token')

        try {
            const response = await this.client.itemPublicTokenExchange({ public_token: publicToken })

            return {
                externalConnectionId: response.data.item_id,
                institutionName: payloadMetadata?.institution?.name,
                secret: { accessToken: response.data.access_token }
            }
        } catch (error) {
            throw toBankSyncError(this.providerId, error)
        }
    }

    /**
     * Lists the bank accounts covered by this item.
     * @param params The decrypted secret holding the item's access token.
     * @returns The normalized list of external accounts.
     */
    async listAccounts(params: { secret: BankSyncCredentialInput }): Promise<BankSyncExternalAccount[]> {
        const accessToken = requireAccessToken(this.providerId, params.secret)

        try {
            const response = await this.client.accountsGet({ access_token: accessToken })

            return response.data.accounts.map(account => ({
                externalAccountId: account.account_id,
                name: account.name,
                currency: account.balances.iso_currency_code ?? 'USD',
                mask: account.mask ?? undefined
            }))
        } catch (error) {
            throw toBankSyncError(this.providerId, error)
        }
    }

    /**
     * Syncs transactions for this item using Plaid's cursor-based `/transactions/sync`,
     * paginating internally until Plaid reports no more pages.
     * @param params The decrypted secret and the last persisted cursor (null on first sync).
     * @returns The added/modified/removed transactions and the cursor to persist for next time.
     */
    async syncTransactions(params: {
        secret: BankSyncCredentialInput
        cursor: string | null
    }): Promise<SyncTransactionsResult> {
        const accessToken = requireAccessToken(this.providerId, params.secret)

        const added: ExternalTransaction[] = []
        const modified: ExternalTransaction[] = []
        const removedExternalIds: string[] = []
        let cursor = params.cursor ?? undefined
        let hasMore = true

        try {
            while (hasMore) {
                const response = await this.client.transactionsSync({ access_token: accessToken, cursor })

                added.push(...response.data.added.map(mapPlaidTransaction))
                modified.push(...response.data.modified.map(mapPlaidTransaction))
                removedExternalIds.push(
                    ...response.data.removed
                        .map((item: RemovedTransaction) => item.transaction_id)
                        .filter((id): id is string => Boolean(id))
                )

                cursor = response.data.next_cursor
                hasMore = response.data.has_more
            }
        } catch (error) {
            throw toBankSyncError(this.providerId, error)
        }

        return { added, modified, removedExternalIds, nextCursor: cursor ?? null }
    }

    parseWebhook(payload: unknown): BankSyncWebhookEvent | null {
        return parsePlaidWebhook(payload)
    }
}

/**
 * Resolves a Plaid webhook payload to the item it concerns. Standalone (no app credentials
 * needed) so the webhook controller can resolve which connection a payload concerns before it
 * knows which user — and therefore which app credentials — are involved. Note: this only parses
 * the payload shape — it does not verify Plaid's webhook JWT signature, so callers must treat the
 * resolved connection id as a hint to re-sync, not as proof of authenticity.
 * @param payload The raw webhook body.
 * @returns The resolved webhook event, or null if the payload isn't a recognizable Plaid webhook.
 */
export function parsePlaidWebhook(payload: unknown): BankSyncWebhookEvent | null {
    if (!isPlaidWebhookPayload(payload)) return null
    return {
        externalConnectionId: payload.item_id,
        kind: payload.webhook_type === 'TRANSACTIONS' ? 'transactions' : 'status'
    }
}

/**
 * Type guard checking a webhook payload carries the `item_id`/`webhook_type` fields every Plaid
 * webhook is expected to have.
 * @param payload The raw, unparsed webhook body.
 * @returns True if the payload has the shape of a Plaid webhook.
 */
function isPlaidWebhookPayload(payload: unknown): payload is { item_id: string; webhook_type: string } {
    return (
        typeof payload === 'object' &&
        payload !== null &&
        typeof (payload as { item_id?: unknown }).item_id === 'string' &&
        typeof (payload as { webhook_type?: unknown }).webhook_type === 'string'
    )
}

/**
 * Normalizes a Plaid transaction to the common `ExternalTransaction` shape.
 * @param transaction The Plaid SDK transaction to normalize.
 * @returns The normalized external transaction.
 */
function mapPlaidTransaction(transaction: PlaidTransaction): ExternalTransaction {
    return {
        externalId: transaction.transaction_id,
        date: transaction.date,
        // Plaid reports outflows as positive amounts; Poveroh amounts are signed by transaction action, so invert here.
        amount: -transaction.amount,
        currency: (transaction.iso_currency_code ?? 'USD') as CurrencyEnum,
        description: transaction.name,
        pending: transaction.pending
    }
}
