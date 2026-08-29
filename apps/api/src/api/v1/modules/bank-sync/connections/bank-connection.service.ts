import type {
    BankSyncConnection,
    BankSyncConnectionWithConnectUrlResponse,
    BankSyncCredentialInput,
    BankSyncProvider,
    CompleteBankSyncConnectionRequest,
    CreateBankSyncConnectionRequest
} from '@poveroh/types'
import { BANK_SYNC_CREDENTIAL_ALGO_V1, CREDENTIAL_DOMAIN_BANK_SYNC, BankSyncError } from '@poveroh/types'
import { createBankSyncClient } from '@poveroh/bank-sync'
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
    decryptPayloadWithApplicationSecret,
    encryptPayloadWithApplicationSecret,
    toPrismaBytes
} from '@/utils'
import config from '@/utils/environment'
import { BaseService } from '@/v1/modules/base/base.service'
import { BANK_SYNC_PROVIDER_REGISTRY, getBankSyncProviderDefinition } from '@/v1/content/template/bank-sync-providers'
import { eventBus } from '@/v1/worker/events/event-bus'
import { getJobDispatcher } from '@/utils/queue'
import { BankSyncAppCredentialService } from '../app-credentials/bank-sync-app-credential.service'
import { BankSyncAccountRepository } from '../accounts/bank-sync-account.repository'
import { BankConnectionRepository, type BankConnectionWithSecretRecord } from './bank-connection.repository'

/**
 * Service that owns the bank-sync connection lifecycle: listing providers, starting/completing
 * connections (both hosted and credentials flows), revoking connections, and decrypting a
 * connection's secret for the accounts/sync services.
 */
export class BankConnectionService extends BaseService {
    private readonly connectionRepository = new BankConnectionRepository()
    private readonly accountRepository = new BankSyncAccountRepository()
    private readonly appCredentialService = new BankSyncAppCredentialService()

    constructor() {
        super('bank-sync')
    }

    /**
     * Returns the static provider registry enriched with a per-user connection count and whether
     * the user has configured the provider's app-level credentials (trivially true for providers
     * that need none).
     * @returns A promise that resolves to the list of providers with per-user metadata.
     */
    async getProviders(): Promise<BankSyncProvider[]> {
        const userId = this.context.currentUser.id
        const [counts, configuredProviderIds] = await Promise.all([
            this.connectionRepository.countByProvider(userId),
            this.appCredentialService.listConfiguredProviderIds()
        ])
        const configuredSet = new Set(configuredProviderIds)

        return BANK_SYNC_PROVIDER_REGISTRY.map(provider => ({
            ...provider,
            connectionCount: counts[provider.id] ?? 0,
            configured: provider.appCredentialFields.length === 0 || configuredSet.has(provider.id)
        }))
    }

    /**
     * Lists the authenticated user's non-revoked bank connections.
     * @returns A promise that resolves to the user's connections.
     */
    async listConnections(): Promise<BankSyncConnection[]> {
        const userId = this.context.currentUser.id
        const connections = await this.connectionRepository.listByUser(userId)
        return connections as unknown as BankSyncConnection[]
    }

    /**
     * Starts a new connection: for a hosted-flow provider this returns a connect URL and a
     * `PENDING` connection to complete later; for a credentials-flow provider this exchanges the
     * submitted credentials immediately and returns an already-`LINKED` connection. If the
     * provider needs app-level credentials and the request carries them, they are saved first so
     * this is also how a user configures a provider for the first time.
     * @param payload The provider to connect, any submitted connection credentials, and any submitted app-level credentials.
     * @returns A promise that resolves to the created connection and, for hosted flows, the connect URL to open.
     */
    async createConnection(
        payload: CreateBankSyncConnectionRequest
    ): Promise<BankSyncConnectionWithConnectUrlResponse> {
        const definition = this.assertProviderRegistered(payload.providerId)
        const userId = this.context.currentUser.id

        if (payload.appCredentials) {
            await this.appCredentialService.saveCredential(payload.providerId, payload.appCredentials)
        }

        const appCredentials = await this.resolveAppCredentials(
            payload.providerId,
            definition.appCredentialFields.length > 0
        )

        const client = createBankSyncClient(payload.providerId, appCredentials)

        if (definition.connectFlow === 'hosted') {
            const connection = await this.connectionRepository.create({
                userId,
                providerId: payload.providerId,
                status: 'PENDING'
            })
            const redirectUri = this.buildRedirectUri(payload.providerId, connection.id)

            const result = await this.runProviderCall(payload.providerId, () =>
                client.initiateConnection({ userId, redirectUri })
            )
            if (result.flow !== 'hosted') {
                throw new InternalServerError(
                    `Provider "${payload.providerId}" declared a hosted flow but did not return one`
                )
            }

            return { connection: connection, connectUrl: result.connectUrl }
        }

        if (!payload.credentials || Object.keys(payload.credentials).length === 0) {
            throw new BadRequestError(`Provider "${payload.providerId}" requires credentials`)
        }

        const result = await this.runProviderCall(payload.providerId, () =>
            client.completeConnection({ userId, credentials: payload.credentials })
        )
        const encrypted = this.encryptSecret(result.secret)

        const connection = await this.connectionRepository.create({
            userId,
            providerId: payload.providerId,
            status: 'LINKED',
            externalConnectionId: result.externalConnectionId,
            institutionName: result.institutionName,
            ...encrypted
        })

        await eventBus.emit('bank-sync-connection.linked', {
            userId,
            connectionId: connection.id,
            providerId: connection.providerId
        })

        return { connection: connection as unknown as BankSyncConnection, connectUrl: null }
    }

    /**
     * Completes a hosted-flow connection using the provider's callback payload (e.g. Plaid's
     * `public_token`, or a `connection_id` read off a redirect/webhook).
     * @param connectionId The `PENDING` connection to complete.
     * @param payload The provider's callback payload.
     * @returns A promise that resolves to the now-linked connection.
     */
    async completeConnection(
        connectionId: string,
        payload: CompleteBankSyncConnectionRequest
    ): Promise<BankSyncConnection> {
        const userId = this.context.currentUser.id
        const connection = await this.connectionRepository.findById(userId, connectionId)
        if (!connection) throw new NotFoundError('Bank connection not found')

        const definition = this.assertProviderRegistered(connection.providerId)
        const appCredentials = await this.resolveAppCredentials(
            connection.providerId,
            definition.appCredentialFields.length > 0
        )
        const client = createBankSyncClient(connection.providerId, appCredentials)

        const result = await this.runProviderCall(connection.providerId, () =>
            client.completeConnection({ userId, callbackPayload: payload.callbackPayload, metadata: payload.metadata })
        )
        const encrypted = this.encryptSecret(result.secret)

        const updated = await this.connectionRepository.update(connectionId, {
            status: 'LINKED',
            externalConnectionId: result.externalConnectionId,
            institutionName: result.institutionName,
            ...encrypted
        })

        await eventBus.emit('bank-sync-connection.linked', { userId, connectionId, providerId: connection.providerId })

        return updated
    }

    /**
     * Revokes a connection: soft-deletes it, wipes its encrypted secret, and releases its account
     * mappings so their FinancialAccounts can be linked again through a new connection. The
     * mapping rows themselves are kept, preserving the transactions the connection produced.
     * @param connectionId The connection to revoke.
     */
    async deleteConnection(connectionId: string): Promise<void> {
        const userId = this.context.currentUser.id
        const connection = await this.connectionRepository.findById(userId, connectionId)
        if (!connection) throw new NotFoundError('Bank connection not found')

        await this.connectionRepository.revoke(connectionId)
        await this.accountRepository.releaseByConnection(connectionId)

        await eventBus.emit('bank-sync-connection.deleted', { userId, connectionId, providerId: connection.providerId })
    }

    /**
     * Dispatches the same sync job the nightly cron uses, scoped to a single connection.
     * @param connectionId The connection to sync now.
     */
    async triggerSync(connectionId: string): Promise<void> {
        const userId = this.context.currentUser.id
        const connection = await this.connectionRepository.findById(userId, connectionId)
        if (!connection) throw new NotFoundError('Bank connection not found')
        if (connection.status !== 'LINKED') throw new BadRequestError('Connection is not linked yet')

        await getJobDispatcher().dispatch('bank-sync.sync-connection', { userId, connectionId, trigger: 'MANUAL' })
    }

    /**
     * Fetches a connection with its encrypted secret and decrypts it, for use by the accounts and
     * sync services. Scoped to the current request user.
     * @param connectionId The connection whose secret is being decrypted.
     * @returns A promise that resolves to the connection record and its decrypted secret.
     */
    async getConnectionWithDecryptedSecret(
        connectionId: string
    ): Promise<{ connection: BankConnectionWithSecretRecord; secret: BankSyncCredentialInput }> {
        const userId = this.context.currentUser.id
        const connection = await this.connectionRepository.findByIdWithSecret(userId, connectionId)
        if (!connection) throw new NotFoundError('Bank connection not found')

        return { connection, secret: this.decryptSecret(connection) }
    }

    /**
     * Looks up which connection (and owning user) a provider webhook concerns.
     * @param providerId The provider the webhook came from.
     * @param externalConnectionId The provider's own connection identifier, parsed from the webhook payload.
     * @returns A promise that resolves to the connection identity, or null if unknown.
     */
    async findConnectionForWebhook(
        providerId: string,
        externalConnectionId: string
    ): Promise<{ id: string; userId: string } | null> {
        return this.connectionRepository.findByProviderAndExternalId(providerId, externalConnectionId)
    }

    /**
     * Resolves the app-level credentials to pass into `createBankSyncClient`, decrypted from the
     * user's saved provider credential. Throws when the provider requires app credentials and
     * none have been configured yet.
     * @param providerId The provider whose app-level credentials are being resolved.
     * @param required Whether the provider's registry entry declares app-level credential fields.
     * @returns A promise that resolves to the decrypted app-level credential map (empty when none are required).
     */
    private async resolveAppCredentials(providerId: string, required: boolean): Promise<BankSyncCredentialInput> {
        if (!required) return {}

        const credentials = await this.appCredentialService.getDecryptedAppCredential(providerId)
        if (!credentials) {
            throw new BadRequestError(`Provider "${providerId}" requires app-level credentials. Configure them first.`)
        }

        return credentials
    }

    /**
     * Encrypts a provider secret with the application secret before it is persisted.
     * @param secret The plaintext credential payload to encrypt.
     * @returns The ciphertext, iv, auth tag, and algo identifier to store alongside the connection.
     */
    private encryptSecret(secret: BankSyncCredentialInput): {
        ciphertext: Uint8Array<ArrayBuffer>
        iv: Uint8Array<ArrayBuffer>
        authTag: Uint8Array<ArrayBuffer>
        algo: string
    } {
        const encrypted = encryptPayloadWithApplicationSecret(
            config.JWT_SECRET,
            JSON.stringify(secret ?? {}),
            CREDENTIAL_DOMAIN_BANK_SYNC
        )
        return {
            ciphertext: toPrismaBytes(encrypted.ciphertext),
            iv: toPrismaBytes(encrypted.iv),
            authTag: toPrismaBytes(encrypted.authTag),
            algo: BANK_SYNC_CREDENTIAL_ALGO_V1
        }
    }

    /**
     * Decrypts a connection's stored secret, rejecting records saved with a legacy algo.
     * @param record The connection record carrying the encrypted secret fields.
     * @returns The decrypted credential payload, or an empty object when no secret is stored.
     */
    private decryptSecret(record: BankConnectionWithSecretRecord): BankSyncCredentialInput {
        if (!record.ciphertext || !record.iv || !record.authTag) return {}
        if (record.algo !== BANK_SYNC_CREDENTIAL_ALGO_V1) {
            throw new BadRequestError('Connection was saved with legacy encryption. Reconnect the provider.')
        }

        const plaintext = decryptPayloadWithApplicationSecret(
            config.JWT_SECRET,
            {
                ciphertext: Buffer.from(record.ciphertext),
                iv: Buffer.from(record.iv),
                authTag: Buffer.from(record.authTag)
            },
            CREDENTIAL_DOMAIN_BANK_SYNC
        )

        return JSON.parse(plaintext) as BankSyncCredentialInput
    }

    /**
     * Builds the callback URL a hosted-flow provider should redirect back to after linking,
     * carrying the provider and connection ids so the callback page can complete the right row.
     * @param providerId The provider being connected.
     * @param connectionId The `PENDING` connection to complete on callback.
     * @returns The absolute redirect URI to pass to the provider.
     */
    private buildRedirectUri(providerId: string, connectionId: string): string {
        const appUrl = config.APP_URL || 'http://localhost:3000'
        return `${appUrl.replace(/\/$/, '')}/settings/bank-sync/callback?providerId=${encodeURIComponent(providerId)}&connectionId=${encodeURIComponent(connectionId)}`
    }

    /**
     * Asserts a provider id is known and enabled before it is used to create or complete a connection.
     * @param providerId The provider identifier to check.
     * @returns The provider's registry definition.
     */
    private assertProviderRegistered(providerId: string) {
        const definition = getBankSyncProviderDefinition(providerId)
        if (!definition || !definition.enabled) {
            throw new BadRequestError(`Unknown bank-sync provider: ${providerId}`)
        }
        return definition
    }

    /**
     * Runs a bank-sync adapter call, translating a `BankSyncError` into the matching `HttpError`
     * subclass based on the provider's reported status code.
     * @param providerId The provider the call is being made against, used in error messages.
     * @param call The adapter call to run.
     * @returns A promise that resolves to the call's result.
     */
    private async runProviderCall<T>(providerId: string, call: () => Promise<T>): Promise<T> {
        try {
            return await call()
        } catch (error) {
            if (error instanceof BankSyncError) {
                if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
                    throw new BadRequestError(
                        `Bank-sync provider "${providerId}" rejected the request: ${error.message}`
                    )
                }
                throw new InternalServerError(`Bank-sync request to "${providerId}" failed: ${error.message}`)
            }
            throw error
        }
    }
}
