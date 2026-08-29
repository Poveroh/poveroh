import prisma, { Prisma } from '@poveroh/prisma'
import type { BankSyncConnection, BankSyncConnectionStatusEnum, CreateBankConnectionInput } from '@poveroh/types'
import { bankConnectionSelect, bankConnectionWithSecretSelect } from '@/types/select'

export type BankConnectionWithSecretRecord = Prisma.BankConnectionGetPayload<{
    select: typeof bankConnectionWithSecretSelect
}>

export class BankConnectionRepository {
    /**
     * Lists the non-revoked bank connections for a user.
     * @param userId The ID of the user whose connections are being retrieved.
     * @returns A promise that resolves to the user's bank connections.
     */
    async listByUser(userId: string): Promise<BankSyncConnection[]> {
        return prisma.bankConnection.findMany({
            where: { userId, deletedAt: null },
            select: bankConnectionSelect,
            orderBy: { createdAt: 'desc' }
        }) as unknown as BankSyncConnection[]
    }

    /**
     * Counts non-revoked connections per provider for a user, used to render the "configured" state on the providers list.
     * @param userId The ID of the user whose connections are being counted.
     * @returns A promise that resolves to a map of providerId to connection count.
     */
    async countByProvider(userId: string): Promise<Record<string, number>> {
        const rows = await prisma.bankConnection.groupBy({
            by: ['providerId'],
            where: { userId, deletedAt: null },
            _count: { _all: true }
        })

        return Object.fromEntries(rows.map(row => [row.providerId, row._count._all]))
    }

    /**
     * Retrieves a single connection scoped to its owning user, without the encrypted secret.
     * @param userId The ID of the user who owns the connection.
     * @param connectionId The connection to retrieve.
     * @returns A promise that resolves to the connection, or null if not found.
     */
    async findById(userId: string, connectionId: string): Promise<BankSyncConnection | null> {
        return prisma.bankConnection.findFirst({
            where: { id: connectionId, userId, deletedAt: null },
            select: bankConnectionSelect
        }) as unknown as BankSyncConnection | null
    }

    /**
     * Retrieves a single connection including its encrypted secret, scoped to its owning user.
     * @param userId The ID of the user who owns the connection.
     * @param connectionId The connection to retrieve.
     * @returns A promise that resolves to the connection with its secret, or null if not found.
     */
    async findByIdWithSecret(userId: string, connectionId: string): Promise<BankConnectionWithSecretRecord | null> {
        return prisma.bankConnection.findFirst({
            where: { id: connectionId, userId, deletedAt: null },
            select: bankConnectionWithSecretSelect
        })
    }

    /**
     * Looks up a connection's identity (id + owning userId) by provider and external connection id,
     * for resolving an incoming webhook (which carries no session) to the connection it concerns.
     * @param providerId The provider the webhook came from.
     * @param externalConnectionId The provider's own connection identifier.
     * @returns A promise that resolves to the connection identity, or null if not found.
     */
    async findByProviderAndExternalId(
        providerId: string,
        externalConnectionId: string
    ): Promise<{ id: string; userId: string } | null> {
        return prisma.bankConnection.findFirst({
            where: { providerId, externalConnectionId, deletedAt: null },
            select: { id: true, userId: true }
        })
    }

    /**
     * Lists the id/userId pairs of every linked connection across all users, for the nightly cron fan-out.
     * @returns A promise that resolves to the list of linked connection identifiers.
     */
    async findAllLinkedAcrossUsers(): Promise<Array<{ id: string; userId: string }>> {
        return prisma.bankConnection.findMany({
            where: { status: 'LINKED', deletedAt: null },
            select: { id: true, userId: true }
        })
    }

    /**
     * Creates a new connection record.
     * @param input The connection fields to persist.
     * @returns A promise that resolves to the created connection.
     */
    async create(payload: CreateBankConnectionInput): Promise<BankSyncConnection> {
        return prisma.bankConnection.create({
            data: payload,
            select: bankConnectionSelect
        }) as unknown as BankSyncConnection
    }

    /**
     * Updates a connection after a hosted-flow completion or a sync run.
     * @param connectionId The connection to update.
     * @param data The fields to update.
     * @returns A promise that resolves to the updated connection.
     */
    async update(
        connectionId: string,
        data: Partial<{
            status: BankSyncConnectionStatusEnum
            externalConnectionId: string
            institutionName: string
            ciphertext: Uint8Array<ArrayBuffer>
            iv: Uint8Array<ArrayBuffer>
            authTag: Uint8Array<ArrayBuffer>
            algo: string
            lastSyncedAt: Date
            lastSyncError: string | null
        }>
    ): Promise<BankSyncConnection> {
        return prisma.bankConnection.update({
            where: { id: connectionId },
            data,
            select: bankConnectionSelect
        }) as unknown as BankSyncConnection
    }

    /**
     * Revokes a connection: soft-deletes the row and wipes its encrypted secret in the same update,
     * preserving history for the transactions that reference it while destroying the actual credential.
     * @param connectionId The connection to revoke.
     */
    async revoke(connectionId: string): Promise<void> {
        await prisma.bankConnection.update({
            where: { id: connectionId },
            data: {
                status: 'REVOKED',
                deletedAt: new Date(),
                ciphertext: null,
                iv: null,
                authTag: null,
                algo: null
            }
        })
    }
}
