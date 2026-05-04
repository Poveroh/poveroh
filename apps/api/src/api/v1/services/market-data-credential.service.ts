import prisma from '@poveroh/prisma'

import {
    BadRequestError,
    CREDENTIAL_PAYLOAD_ALGO_V1,
    decryptPayloadWithApplicationSecret,
    encryptPayloadWithApplicationSecret,
    toPrismaBytes
} from '@/src/utils'
import config from '@/src/utils/environment'
import { BaseService } from './base.service'
import { isKnownProvider } from '../content/template/market-data-providers'

type CredentialPayload = Record<string, string>

// Service that owns encrypted provider credential records.
// Credentials are encrypted with the application secret, so the UI only needs
// an authenticated session and the provider API key.
export class MarketDataCredentialService extends BaseService {
    constructor(userId: string) {
        super(userId, 'market-data-credential')
    }

    // Returns the providerIds the user has already configured, used by the frontend to render the status badge.
    async listConfiguredProviderIds(): Promise<string[]> {
        const userId = this.getUserId()
        const rows = await prisma.marketDataProviderCredential.findMany({
            where: { userId },
            select: { providerId: true }
        })

        return rows.map(row => row.providerId)
    }

    // Stores or replaces the encrypted credential for a single provider.
    async saveCredential(providerId: string, payload: CredentialPayload): Promise<void> {
        if (!isKnownProvider(providerId)) {
            throw new BadRequestError(`Unknown market data provider: ${providerId}`)
        }

        const userId = this.getUserId()
        const encrypted = encryptPayloadWithApplicationSecret(config.JWT_SECRET, JSON.stringify(payload))

        await prisma.marketDataProviderCredential.upsert({
            where: { userId_providerId: { userId, providerId } },
            create: {
                userId,
                providerId,
                ciphertext: toPrismaBytes(encrypted.ciphertext),
                iv: toPrismaBytes(encrypted.iv),
                authTag: toPrismaBytes(encrypted.authTag),
                algo: CREDENTIAL_PAYLOAD_ALGO_V1
            },
            update: {
                ciphertext: toPrismaBytes(encrypted.ciphertext),
                iv: toPrismaBytes(encrypted.iv),
                authTag: toPrismaBytes(encrypted.authTag),
                algo: CREDENTIAL_PAYLOAD_ALGO_V1
            }
        })
    }

    // Removes the credential for a single provider. No password required because nothing is decrypted.
    async deleteCredential(providerId: string): Promise<void> {
        if (!isKnownProvider(providerId)) {
            throw new BadRequestError(`Unknown market data provider: ${providerId}`)
        }

        const userId = this.getUserId()
        await prisma.marketDataProviderCredential.deleteMany({
            where: { userId, providerId }
        })
    }

    // Decrypts and returns the credential payload for a provider. Used by future fetchers
    // when they actually need to call the provider API on the user's behalf.
    async getDecryptedCredential(providerId: string): Promise<CredentialPayload | null> {
        if (!isKnownProvider(providerId)) {
            throw new BadRequestError(`Unknown market data provider: ${providerId}`)
        }

        const userId = this.getUserId()
        const record = await prisma.marketDataProviderCredential.findUnique({
            where: { userId_providerId: { userId, providerId } }
        })

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
