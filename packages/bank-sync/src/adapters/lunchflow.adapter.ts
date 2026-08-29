import type {
    BankSyncCredentialInput,
    BankSyncWebhookEvent,
    CompleteConnectionResult,
    BankSyncExternalAccount,
    ExternalTransaction,
    InitiateConnectionResult,
    SyncTransactionsResult,
    LunchFlowAccountsResponse,
    LunchFlowExchangeResponse,
    LunchFlowLinkTokenResponse,
    LunchFlowSyncResponse,
    CurrencyEnum
} from '@poveroh/types'
import { BankSyncError } from '@poveroh/types'
import { BaseBankSyncAdapter } from './base.adapter'
import { requireAccessToken } from '../utils/token'

const LUNCHFLOW_BASE_URL = 'https://lunchflow.app/api/v1'

/**
 * LunchFlow adapter. LunchFlow's exact endpoint contracts (paths, payload field names) were not
 * fully verifiable from public docs at implementation time — this models a Plaid-like hosted
 * link-token flow, LunchFlow's closest documented category (multi-institution aggregator with
 * a REST API and SDKs). Everything provider-specific is isolated in this file and its types, so
 * if real sandbox docs turn out to differ, only this adapter and `lunchflow.types.ts` need updating.
 */
export class LunchFlowAdapter extends BaseBankSyncAdapter {
    readonly providerId = 'lunchflow'

    constructor(private readonly apiKey: string) {
        super()
    }

    /**
     * Requests a hosted link token, opened client-side by LunchFlow's connect widget.
     * @param params The user starting the connection and the redirect URI to honor.
     * @returns The hosted-flow result carrying the link token/URL.
     */
    async initiateConnection(params: { userId: string; redirectUri: string }): Promise<InitiateConnectionResult> {
        const response = await this.fetchJson<LunchFlowLinkTokenResponse>(`${LUNCHFLOW_BASE_URL}/link/token`, {
            method: 'POST',
            headers: this.authHeaders(),
            data: { user_id: params.userId, redirect_uri: params.redirectUri }
        })

        return { flow: 'hosted', connectUrl: response.link_token }
    }

    /**
     * Exchanges the widget's public token for a durable access token.
     * @param params The callback payload carrying the `publicToken`.
     * @returns The linked connection identity and the plaintext secret to encrypt and persist.
     */
    async completeConnection(params: { callbackPayload?: Record<string, string> }): Promise<CompleteConnectionResult> {
        const publicToken = params.callbackPayload?.publicToken
        if (!publicToken) throw new BankSyncError(this.providerId, 'Missing LunchFlow public token')

        const response = await this.fetchJson<LunchFlowExchangeResponse>(`${LUNCHFLOW_BASE_URL}/link/exchange`, {
            method: 'POST',
            headers: this.authHeaders(),
            data: { public_token: publicToken }
        })

        return {
            externalConnectionId: response.connection_id,
            institutionName: response.institution_name,
            secret: { accessToken: response.access_token }
        }
    }

    /**
     * Lists the bank accounts covered by this connection.
     * @param params The decrypted secret and the connection's external id.
     * @returns The normalized list of external accounts.
     */
    async listAccounts(params: {
        secret: BankSyncCredentialInput
        externalConnectionId: string
    }): Promise<BankSyncExternalAccount[]> {
        const accessToken = requireAccessToken(this.providerId, params.secret)

        const response = await this.fetchJson<LunchFlowAccountsResponse>(`${LUNCHFLOW_BASE_URL}/accounts`, {
            headers: { ...this.authHeaders(), Authorization: `Bearer ${accessToken}` },
            params: { connection_id: params.externalConnectionId }
        })

        return response.accounts.map(account => ({
            externalAccountId: account.account_id,
            name: account.name,
            currency: account.currency,
            mask: account.mask
        }))
    }

    /**
     * Syncs transactions for one account using LunchFlow's assumed cursor-based sync endpoint.
     * @param params The decrypted secret, target account, and the last persisted cursor.
     * @returns The added/modified/removed transactions and the cursor to persist for next time.
     */
    async syncTransactions(params: {
        secret: BankSyncCredentialInput
        externalConnectionId: string
        externalAccountId: string
        cursor: string | null
    }): Promise<SyncTransactionsResult> {
        const accessToken = requireAccessToken(this.providerId, params.secret)

        const response = await this.fetchJson<LunchFlowSyncResponse>(`${LUNCHFLOW_BASE_URL}/transactions/sync`, {
            headers: { ...this.authHeaders(), Authorization: `Bearer ${accessToken}` },
            params: {
                connection_id: params.externalConnectionId,
                account_id: params.externalAccountId,
                cursor: params.cursor ?? undefined
            }
        })

        return {
            added: response.added.map(mapLunchFlowTransaction),
            modified: response.modified.map(mapLunchFlowTransaction),
            removedExternalIds: response.removed_transaction_ids,
            nextCursor: response.next_cursor
        }
    }

    // Builds the app-level auth headers shared by every LunchFlow request.
    private authHeaders(): Record<string, string> {
        return { 'X-Api-Key': this.apiKey }
    }

    parseWebhook(payload: unknown): BankSyncWebhookEvent | null {
        return parseLunchFlowWebhook(payload)
    }
}

/**
 * Resolves a LunchFlow webhook payload to the connection it concerns, assuming the same
 * `connection_id` field shape as the rest of this adapter's assumed contract (see class doc
 * comment). Standalone (no app credentials needed) so the webhook controller can resolve which
 * connection a payload concerns before it knows which user is involved. Does not verify any
 * signature, so callers must treat the result as a re-sync hint.
 * @param payload The raw webhook body.
 * @returns The resolved webhook event, or null if the payload isn't recognizable.
 */
export function parseLunchFlowWebhook(payload: unknown): BankSyncWebhookEvent | null {
    if (!isLunchFlowWebhookPayload(payload)) return null
    return { externalConnectionId: payload.connection_id, kind: 'transactions' }
}

/**
 * Type guard checking a webhook payload carries the `connection_id` field this adapter's
 * assumed webhook contract expects.
 * @param payload The raw, unparsed webhook body.
 * @returns True if the payload has the shape of a LunchFlow webhook.
 */
function isLunchFlowWebhookPayload(payload: unknown): payload is { connection_id: string } {
    return (
        typeof payload === 'object' &&
        payload !== null &&
        typeof (payload as { connection_id?: unknown }).connection_id === 'string'
    )
}

/**
 * Normalizes a LunchFlow transaction to the common `ExternalTransaction` shape.
 * @param transaction The LunchFlow API transaction to normalize.
 * @returns The normalized external transaction.
 */
function mapLunchFlowTransaction(transaction: {
    transaction_id: string
    date: string
    amount: number
    currency: string
    description: string
    pending?: boolean
}): ExternalTransaction {
    return {
        externalId: transaction.transaction_id,
        date: transaction.date,
        amount: transaction.amount,
        currency: transaction.currency as CurrencyEnum,
        description: transaction.description,
        pending: transaction.pending
    }
}
