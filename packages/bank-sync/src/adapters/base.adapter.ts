import type {
    BankSyncAdapter,
    BankSyncCredentialInput,
    BankSyncWebhookEvent,
    CompleteConnectionResult,
    BankSyncExternalAccount,
    InitiateConnectionResult,
    SyncTransactionsResult
} from '@poveroh/types'
import { BANK_SYNC_REQUEST_TIMEOUT_MS } from '@poveroh/types'
import axios, { type AxiosRequestConfig } from 'axios'
import { toBankSyncError } from '../utils/errors'

/**
 * Shared behaviour for HTTP-based provider adapters: a JSON request helper with a
 * request timeout and consistent error normalization to BankSyncError.
 */
export abstract class BaseBankSyncAdapter implements BankSyncAdapter {
    abstract readonly providerId: string

    abstract initiateConnection(params: { userId: string; redirectUri: string }): Promise<InitiateConnectionResult>
    abstract completeConnection(params: {
        userId: string
        callbackPayload?: Record<string, string>
        credentials?: BankSyncCredentialInput
        providerState?: string
    }): Promise<CompleteConnectionResult>
    abstract listAccounts(params: {
        secret: BankSyncCredentialInput
        externalConnectionId: string
    }): Promise<BankSyncExternalAccount[]>
    abstract syncTransactions(params: {
        secret: BankSyncCredentialInput
        externalConnectionId: string
        externalAccountId: string
        cursor: string | null
    }): Promise<SyncTransactionsResult>

    parseWebhook?(payload: unknown, headers: Record<string, string>): BankSyncWebhookEvent | null

    /**
     * Performs an HTTP request and returns the parsed JSON body, wrapping any transport,
     * status or parse failure into a BankSyncError tagged with the provider id.
     * @param url The fully-built request URL.
     * @param config Optional axios request config (method, headers, data, auth, ...).
     * @returns The parsed JSON payload typed as T.
     */
    protected async fetchJson<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
        try {
            const response = await axios.request<T>({
                url,
                timeout: BANK_SYNC_REQUEST_TIMEOUT_MS,
                ...config
            })

            return response.data
        } catch (error) {
            throw toBankSyncError(this.providerId, error)
        }
    }
}
