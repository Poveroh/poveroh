import { BankSyncConnectionStatusEnum, BankSyncCredentialInput, CurrencyEnum } from '@poveroh/contracts'

export type CreateBankConnectionInput = {
    userId: string
    providerId: string
    status: BankSyncConnectionStatusEnum
    externalConnectionId?: string
    institutionName?: string
    ciphertext?: Uint8Array<ArrayBuffer>
    iv?: Uint8Array<ArrayBuffer>
    authTag?: Uint8Array<ArrayBuffer>
    algo?: string
}

export type CredentialFieldSpec = {
    key: string
    label: string
    secret?: boolean
}

export type InitiateConnectionResult =
    | { flow: 'hosted'; connectUrl: string; providerState?: string }
    | { flow: 'credentials'; fields: CredentialFieldSpec[] }

export type CompleteConnectionResult = {
    externalConnectionId: string
    institutionName?: string
    secret: BankSyncCredentialInput
}

export type BankSyncExternalAccount = {
    externalAccountId: string
    name: string
    currency: string
    mask?: string
}

export type ExternalTransaction = {
    externalId: string
    date: string
    amount: number
    currency: CurrencyEnum
    description: string
    pending?: boolean
}

export type SyncTransactionsResult = {
    added: ExternalTransaction[]
    modified: ExternalTransaction[]
    removedExternalIds: string[]
    nextCursor: string | null
}

export type BankSyncWebhookEvent = {
    externalConnectionId: string
    kind: 'transactions' | 'status'
}

export type BankSyncLaunchingConnection = {
    connectionId: string
    connectUrl: string
    providerId: string
}

/**
 * Common interface every bank-sync provider adapter implements. The bank-sync factory returns one
 * of these, so callers never depend on a concrete provider, regardless of whether it is a
 * multi-institution aggregator or a single proprietary bank API.
 */
export interface BankSyncAdapter {
    readonly providerId: string
    initiateConnection(params: { userId: string; redirectUri: string }): Promise<InitiateConnectionResult>
    completeConnection(params: {
        userId: string
        callbackPayload?: Record<string, string>
        metadata?: Record<string, string>
        credentials?: BankSyncCredentialInput
        providerState?: string
    }): Promise<CompleteConnectionResult>
    listAccounts(params: {
        secret: BankSyncCredentialInput
        externalConnectionId: string
    }): Promise<BankSyncExternalAccount[]>
    syncTransactions(params: {
        secret: BankSyncCredentialInput
        externalConnectionId: string
        externalAccountId: string
        cursor: string | null
    }): Promise<SyncTransactionsResult>
    parseWebhook?(payload: unknown, headers: Record<string, string>): BankSyncWebhookEvent | null
}

/**
 * Error thrown for any provider-side failure (unknown provider, missing credentials, upstream
 * HTTP error or unparseable payload). The API layer maps this onto an HttpError so the original
 * provider context is preserved.
 */
export class BankSyncError extends Error {
    constructor(
        public readonly providerId: string,
        message: string,
        public readonly statusCode?: number
    ) {
        super(message)
        this.name = 'BankSyncError'
    }
}
