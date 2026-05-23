import { BadRequestError } from '@/utils'
import {
    CREDENTIAL_PAYLOAD_ALGO_V1,
    decryptPayloadWithApplicationSecret,
    encryptPayloadWithApplicationSecret,
    toPrismaBytes
} from '@/utils'
import config from '@/utils/environment'
import { BaseService } from '@/v1/modules/base/base.service'
import { isKnownProvider } from '@/v1/content/template/market-data-providers'
import { MarketDataRepository } from '../data/market-data.repository'

type CredentialPayload = Record<string, string>

/**
 * Service that owns encrypted provider credential records.
 * Credentials are encrypted with the application secret, so the UI only needs
 * an authenticated session and the provider API key.
 */
export class MarketDataCredentialService extends BaseService {
    private readonly marketDataRepository = new MarketDataRepository()

    constructor() {
        super('market-data-credential')
    }

    /**
     * Stores or replaces the encrypted credential for a single provider.
     * @param providerId The provider for which the credential is being saved.
     * @param payload The plaintext credential payload to encrypt and persist.
     */
    async saveCredential(providerId: string, payload: CredentialPayload): Promise<void> {
        if (!isKnownProvider(providerId)) {
            throw new BadRequestError(`Unknown market data provider: ${providerId}`)
        }

        const userId = this.context.currentUser.id
        const encrypted = encryptPayloadWithApplicationSecret(config.JWT_SECRET, JSON.stringify(payload))

        await this.marketDataRepository.upsertCredential(userId, providerId, {
            ciphertext: toPrismaBytes(encrypted.ciphertext),
            iv: toPrismaBytes(encrypted.iv),
            authTag: toPrismaBytes(encrypted.authTag),
            algo: CREDENTIAL_PAYLOAD_ALGO_V1
        })
    }

    /**
     * Removes the credential for a single provider. No password required because nothing is decrypted.
     * @param providerId The provider whose credential is being removed.
     */
    async deleteCredential(providerId: string): Promise<void> {
        if (!isKnownProvider(providerId)) {
            throw new BadRequestError(`Unknown market data provider: ${providerId}`)
        }

        const userId = this.context.currentUser.id
        await this.marketDataRepository.deleteCredential(userId, providerId)
    }

    /**
     * Decrypts and returns the credential payload for a provider. Used by future fetchers
     * when they actually need to call the provider API on the user's behalf.
     * @param providerId The provider whose credential is being decrypted.
     * @returns A promise that resolves to the decrypted credential payload, or null if not configured.
     */
    async getDecryptedCredential(providerId: string): Promise<CredentialPayload | null> {
        if (!isKnownProvider(providerId)) {
            throw new BadRequestError(`Unknown market data provider: ${providerId}`)
        }

        const userId = this.context.currentUser.id
        const record = await this.marketDataRepository.findCredential(userId, providerId)

        if (!record) return null
        if (record.algo !== CREDENTIAL_PAYLOAD_ALGO_V1) {
            throw new BadRequestError('Provider credential was saved with legacy encryption. Reconnect the provider.')
        }

        const plaintext = decryptPayloadWithApplicationSecret(config.JWT_SECRET, {
            ciphertext: Buffer.from(record.ciphertext),
            iv: Buffer.from(record.iv),
            authTag: Buffer.from(record.authTag)
        })

        return JSON.parse(plaintext) as CredentialPayload
    }
}
