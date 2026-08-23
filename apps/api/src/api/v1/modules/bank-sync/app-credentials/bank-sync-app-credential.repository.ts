import prisma, { Prisma } from '@poveroh/prisma'
import { bankSyncProviderCredentialSelect } from '@/types/select'

type CredentialRecord = Prisma.BankSyncProviderCredentialGetPayload<{ select: typeof bankSyncProviderCredentialSelect }>

export class BankSyncAppCredentialRepository {
    /**
     * Returns the providerIds the user has already configured app-level credentials for.
     * @param userId The ID of the user whose configured providers are being retrieved.
     * @returns A promise that resolves to an array of providerIds the user has configured.
     */
    async listConfiguredProviderIds(userId: string): Promise<string[]> {
        const rows = await prisma.bankSyncProviderCredential.findMany({
            where: { userId },
            select: { providerId: true }
        })

        return rows.map(row => row.providerId)
    }

    /**
     * Retrieves the raw encrypted app-credential record for a specific provider.
     * @param userId The ID of the user who owns the credential.
     * @param providerId The provider whose credential is being retrieved.
     * @returns A promise that resolves to the credential record, or null if none exists.
     */
    async findCredential(userId: string, providerId: string): Promise<CredentialRecord | null> {
        return prisma.bankSyncProviderCredential.findUnique({
            where: { userId_providerId: { userId, providerId } },
            select: bankSyncProviderCredentialSelect
        })
    }

    /**
     * Creates or replaces the encrypted app-credential for a user/provider pair.
     * @param userId The ID of the user who owns the credential.
     * @param providerId The provider for which the credential is being saved.
     * @param payload The encrypted credential payload to persist.
     */
    async upsertCredential(
        userId: string,
        providerId: string,
        payload: {
            ciphertext: Uint8Array<ArrayBuffer>
            iv: Uint8Array<ArrayBuffer>
            authTag: Uint8Array<ArrayBuffer>
            algo: string
        }
    ): Promise<void> {
        await prisma.bankSyncProviderCredential.upsert({
            where: { userId_providerId: { userId, providerId } },
            create: { userId, providerId, ...payload },
            update: payload
        })
    }

    /**
     * Removes the app-credential for a user/provider pair.
     * @param userId The ID of the user who owns the credential.
     * @param providerId The provider whose credential is being removed.
     */
    async deleteCredential(userId: string, providerId: string): Promise<void> {
        await prisma.bankSyncProviderCredential.deleteMany({ where: { userId, providerId } })
    }
}
