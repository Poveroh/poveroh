import prisma, { Prisma } from '@poveroh/prisma'

const credentialSelect = {
    id: true,
    providerId: true,
    ciphertext: true,
    iv: true,
    authTag: true,
    algo: true
} satisfies Prisma.MarketDataProviderCredentialSelect

type CredentialRecord = Prisma.MarketDataProviderCredentialGetPayload<{ select: typeof credentialSelect }>

export type SaveCredentialRecordInput = {
    ciphertext: Uint8Array<ArrayBuffer>
    iv: Uint8Array<ArrayBuffer>
    authTag: Uint8Array<ArrayBuffer>
    algo: string
}

export class MarketDataRepository {
    /**
     * Returns the providerIds the user has already configured.
     * @param userId The ID of the user whose configured providers are being retrieved.
     * @returns A promise that resolves to an array of providerIds the user has configured.
     */
    async listConfiguredProviderIds(userId: string): Promise<string[]> {
        const rows = await prisma.marketDataProviderCredential.findMany({
            where: { userId },
            select: { providerId: true }
        })

        return rows.map(row => row.providerId)
    }

    /**
     * Retrieves the raw encrypted credential record for a specific provider.
     * @param userId The ID of the user who owns the credential.
     * @param providerId The provider whose credential is being retrieved.
     * @returns A promise that resolves to the credential record, or null if no credential exists.
     */
    async findCredential(userId: string, providerId: string): Promise<CredentialRecord | null> {
        return prisma.marketDataProviderCredential.findUnique({
            where: { userId_providerId: { userId, providerId } },
            select: credentialSelect
        })
    }

    /**
     * Creates or replaces the encrypted credential for a user/provider pair.
     * @param userId The ID of the user who owns the credential.
     * @param providerId The provider for which the credential is being saved.
     * @param payload The encrypted credential payload to persist.
     */
    async upsertCredential(userId: string, providerId: string, payload: SaveCredentialRecordInput): Promise<void> {
        await prisma.marketDataProviderCredential.upsert({
            where: { userId_providerId: { userId, providerId } },
            create: {
                userId,
                providerId,
                ciphertext: payload.ciphertext,
                iv: payload.iv,
                authTag: payload.authTag,
                algo: payload.algo
            },
            update: {
                ciphertext: payload.ciphertext,
                iv: payload.iv,
                authTag: payload.authTag,
                algo: payload.algo
            }
        })
    }

    /**
     * Removes the encrypted credential for a user/provider pair.
     * @param userId The ID of the user who owns the credential.
     * @param providerId The provider whose credential is being removed.
     */
    async deleteCredential(userId: string, providerId: string): Promise<void> {
        await prisma.marketDataProviderCredential.deleteMany({
            where: { userId, providerId }
        })
    }
}
