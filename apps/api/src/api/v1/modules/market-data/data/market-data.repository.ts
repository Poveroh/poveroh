import prisma, { Prisma } from '@poveroh/prisma'
import { UpdateCredentialRecordRequest } from '@poveroh/types'
import { credentialSelect } from '@/types/select'

type CredentialRecord = Prisma.MarketDataProviderCredentialGetPayload<{ select: typeof credentialSelect }>

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
    async upsertCredential(userId: string, providerId: string, payload: UpdateCredentialRecordRequest): Promise<void> {
        await prisma.marketDataProviderCredential.upsert({
            where: { userId_providerId: { userId, providerId } },
            create: {
                userId,
                providerId,
                ...payload
            },
            update: payload
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
