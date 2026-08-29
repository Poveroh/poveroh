import type { BankSyncCredentialInput } from '@poveroh/types'
import { BANK_SYNC_CREDENTIAL_ALGO_V1, CREDENTIAL_DOMAIN_BANK_SYNC } from '@poveroh/types'
import {
    BadRequestError,
    decryptPayloadWithApplicationSecret,
    encryptPayloadWithApplicationSecret,
    toPrismaBytes
} from '@/utils'
import config from '@/utils/environment'
import { BaseService } from '@/v1/modules/base/base.service'
import { isKnownBankSyncProvider } from '@/v1/content/template/bank-sync-providers'
import { BankSyncAppCredentialRepository } from './bank-sync-app-credential.repository'

/**
 * Service that owns each user's own app-level provider credentials (e.g. a Plaid client
 * id/secret) — Poveroh never ships with any provider's own credentials baked in, so the
 * self-hosted instance owner enters and stores them here, encrypted, once per provider, and
 * every connection to that provider reuses them.
 */
export class BankSyncAppCredentialService extends BaseService {
    private readonly credentialRepository = new BankSyncAppCredentialRepository()

    constructor() {
        super('bank-sync-app-credential')
    }

    /**
     * Returns the providerIds the current user has already configured app-level credentials for.
     * @returns A promise that resolves to the configured provider ids.
     */
    async listConfiguredProviderIds(): Promise<string[]> {
        const userId = this.context.currentUser.id
        return this.credentialRepository.listConfiguredProviderIds(userId)
    }

    /**
     * Encrypts and stores the app-level credential fields for a provider.
     * @param providerId The provider the credential fields belong to.
     * @param credentials The plaintext credential fields to encrypt and persist.
     */
    async saveCredential(providerId: string, credentials: BankSyncCredentialInput): Promise<void> {
        if (!isKnownBankSyncProvider(providerId)) throw new BadRequestError(`Unknown bank-sync provider: ${providerId}`)

        const userId = this.context.currentUser.id
        const encrypted = encryptPayloadWithApplicationSecret(
            config.JWT_SECRET,
            JSON.stringify(credentials),
            CREDENTIAL_DOMAIN_BANK_SYNC
        )

        await this.credentialRepository.upsertCredential(userId, providerId, {
            ciphertext: toPrismaBytes(encrypted.ciphertext),
            iv: toPrismaBytes(encrypted.iv),
            authTag: toPrismaBytes(encrypted.authTag),
            algo: BANK_SYNC_CREDENTIAL_ALGO_V1
        })
    }

    /**
     * Removes the app-level credential for a provider. No password required because nothing is decrypted.
     * @param providerId The provider whose credential is being removed.
     */
    async deleteCredential(providerId: string): Promise<void> {
        const userId = this.context.currentUser.id
        await this.credentialRepository.deleteCredential(userId, providerId)
    }

    /**
     * Decrypts and returns the app-level credential fields for a provider, scoped to the current request user.
     * @param providerId The provider whose credential is being decrypted.
     * @returns A promise that resolves to the decrypted credential fields, or null if not configured.
     */
    async getDecryptedAppCredential(providerId: string): Promise<BankSyncCredentialInput | null> {
        const userId = this.context.currentUser.id
        return this.getDecryptedAppCredentialForUser(userId, providerId)
    }

    /**
     * Decrypts and returns the app-level credential fields for a provider for an explicit user id.
     * Used by the worker (cron sync, webhooks), which runs outside a per-request user context.
     * @param userId The user whose credential is being decrypted.
     * @param providerId The provider whose credential is being decrypted.
     * @returns A promise that resolves to the decrypted credential fields, or null if not configured.
     */
    async getDecryptedAppCredentialForUser(
        userId: string,
        providerId: string
    ): Promise<BankSyncCredentialInput | null> {
        const record = await this.credentialRepository.findCredential(userId, providerId)
        if (!record) return null

        if (record.algo !== BANK_SYNC_CREDENTIAL_ALGO_V1) {
            throw new BadRequestError(
                `App credential for "${providerId}" was saved with legacy encryption. Reconfigure the provider.`
            )
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
}
