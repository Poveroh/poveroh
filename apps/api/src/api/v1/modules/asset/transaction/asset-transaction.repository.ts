import prisma, { Prisma } from '@poveroh/prisma'
import type {
    AssetTransactionData,
    AssetTransactionFilters,
    CreateAssetTransactionRequest,
    CurrencyEnum,
    UpdateAssetTransactionRequest
} from '@poveroh/types'
import { toIsoString, toNumber } from '@/v1/helpers/asset.helper'
import { buildWhere } from '@/helpers/filter.helper'

const assetTransactionSelect = {
    id: true,
    assetId: true,
    type: true,
    date: true,
    settlementDate: true,
    quantityChange: true,
    unitPrice: true,
    totalAmount: true,
    currency: true,
    fxRate: true,
    fees: true,
    taxAmount: true,
    financialAccountId: true,
    note: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.AssetTransactionSelect

type AssetTransactionRow = Prisma.AssetTransactionGetPayload<{ select: typeof assetTransactionSelect }>

/**
 * Normalizes a Prisma asset transaction row into the API DTO by converting Decimal and Date values into plain JSON-friendly types.
 * @param row The Prisma asset transaction row to convert.
 * @returns The normalized asset transaction data.
 */
function toData(row: AssetTransactionRow): AssetTransactionData {
    return {
        id: row.id,
        assetId: row.assetId,
        type: row.type,
        date: toIsoString(row.date) as string,
        settlementDate: toIsoString(row.settlementDate),
        quantityChange: toNumber(row.quantityChange),
        unitPrice: toNumber(row.unitPrice),
        totalAmount: toNumber(row.totalAmount),
        currency: row.currency as CurrencyEnum,
        fxRate: toNumber(row.fxRate),
        fees: toNumber(row.fees),
        taxAmount: toNumber(row.taxAmount),
        financialAccountId: row.financialAccountId,
        note: row.note,
        createdAt: toIsoString(row.createdAt) as string,
        updatedAt: toIsoString(row.updatedAt) as string
    }
}

export class AssetTransactionRepository {
    /**
     * Creates a new asset transaction in the database, scoping it to the asset identified in the payload.
     * @param id The unique identifier for the asset transaction being created.
     * @param payload The data required to create a new asset transaction.
     * @returns A promise that resolves to the data of the newly created asset transaction.
     */
    async create(id: string, payload: CreateAssetTransactionRequest): Promise<AssetTransactionData> {
        const row = await prisma.assetTransaction.create({
            data: {
                id,
                assetId: payload.assetId,
                type: payload.type,
                date: new Date(payload.date),
                settlementDate: payload.settlementDate ? new Date(payload.settlementDate) : null,
                quantityChange: payload.quantityChange ?? null,
                unitPrice: payload.unitPrice ?? null,
                totalAmount: payload.totalAmount ?? null,
                currency: payload.currency,
                fxRate: payload.fxRate ?? null,
                fees: payload.fees ?? null,
                taxAmount: payload.taxAmount ?? null,
                financialAccountId: payload.financialAccountId ?? null,
                note: payload.note ?? null
            },
            select: assetTransactionSelect
        })

        return toData(row)
    }

    /**
     * Updates an existing asset transaction, ensuring it belongs to the specified user via the parent asset and is not soft-deleted.
     * @param userId The ID of the user who owns the parent asset.
     * @param id The unique identifier of the asset transaction being updated.
     * @param payload The partial fields used to update the asset transaction.
     */
    async update(userId: string, id: string, payload: UpdateAssetTransactionRequest): Promise<void> {
        await prisma.assetTransaction.update({
            where: { id, deletedAt: null, asset: { userId, deletedAt: null } },
            data: {
                ...(payload.assetId !== undefined && { assetId: payload.assetId }),
                ...(payload.type !== undefined && { type: payload.type }),
                ...(payload.date !== undefined && { date: new Date(payload.date) }),
                ...(payload.settlementDate !== undefined && {
                    settlementDate: payload.settlementDate ? new Date(payload.settlementDate) : null
                }),
                ...(payload.quantityChange !== undefined && { quantityChange: payload.quantityChange }),
                ...(payload.unitPrice !== undefined && { unitPrice: payload.unitPrice }),
                ...(payload.totalAmount !== undefined && { totalAmount: payload.totalAmount }),
                ...(payload.currency !== undefined && { currency: payload.currency }),
                ...(payload.fxRate !== undefined && { fxRate: payload.fxRate }),
                ...(payload.fees !== undefined && { fees: payload.fees }),
                ...(payload.taxAmount !== undefined && { taxAmount: payload.taxAmount }),
                ...(payload.financialAccountId !== undefined && { financialAccountId: payload.financialAccountId }),
                ...(payload.note !== undefined && { note: payload.note })
            }
        })
    }

    /**
     * Soft deletes an asset transaction owned by the specified user via the parent asset.
     * @param userId The ID of the user who owns the parent asset.
     * @param id The unique identifier of the asset transaction being deleted.
     * @param deletedAt The timestamp indicating when the deletion occurred.
     */
    async softDelete(userId: string, id: string, deletedAt: Date): Promise<void> {
        await prisma.assetTransaction.update({
            where: { id, deletedAt: null, asset: { userId, deletedAt: null } },
            data: { deletedAt }
        })
    }

    /**
     * Soft deletes every asset transaction owned by the specified user via the parent asset.
     * @param userId The ID of the user whose asset transactions are being deleted.
     * @param deletedAt The timestamp indicating when the deletions occurred.
     */
    async softDeleteAll(userId: string, deletedAt: Date): Promise<void> {
        await prisma.assetTransaction.updateMany({
            where: { deletedAt: null, asset: { userId, deletedAt: null } },
            data: { deletedAt }
        })
    }

    /**
     * Finds an asset transaction by its user-scoped ID, ensuring it belongs to the specified user via the parent asset and is not soft-deleted.
     * @param userId The ID of the user who owns the parent asset.
     * @param id The unique identifier of the asset transaction being retrieved.
     * @returns A promise that resolves to the asset transaction data, or null when no matching row is found.
     */
    async findById(userId: string, id: string): Promise<AssetTransactionData | null> {
        const row = await prisma.assetTransaction.findFirst({
            where: { id, deletedAt: null, asset: { userId, deletedAt: null } },
            select: assetTransactionSelect
        })

        return row ? toData(row) : null
    }

    /**
     * Finds the parent asset ID of an asset transaction owned by the specified user, used to enrich domain events with the parent asset reference.
     * @param userId The ID of the user who owns the parent asset.
     * @param id The unique identifier of the asset transaction being inspected.
     * @returns A promise that resolves to the parent asset ID, or null when no matching row is found.
     */
    async findAssetIdById(userId: string, id: string): Promise<string | null> {
        const row = await prisma.assetTransaction.findFirst({
            where: { id, deletedAt: null, asset: { userId, deletedAt: null } },
            select: { assetId: true }
        })

        return row?.assetId ?? null
    }

    /**
     * Finds asset transactions matching the supplied filters and pagination, scoped to the specified user via the parent asset.
     * @param userId The ID of the user who owns the parent asset.
     * @param filters The filters to apply when retrieving asset transactions.
     * @param skip The number of records to skip for pagination.
     * @param take The number of records to take for pagination.
     * @returns A promise that resolves to the matching asset transactions.
     */
    async findMany(
        userId: string,
        filters: AssetTransactionFilters,
        skip: number,
        take: number
    ): Promise<AssetTransactionData[]> {
        const { id: idFilter, ...rest } = filters
        const where = buildWhere(
            {
                ...rest,
                ...(idFilter?.id && { id: idFilter.id }),
                deletedAt: null,
                asset: { userId, deletedAt: null }
            },
            ['note']
        ) as Prisma.AssetTransactionWhereInput

        const rows = await prisma.assetTransaction.findMany({
            where,
            select: assetTransactionSelect,
            orderBy: { date: 'desc' },
            skip,
            take
        })

        return rows.map(toData)
    }

    /**
     * Verifies that the specified asset exists and is owned by the user, preventing cross-tenant references when creating or updating transactions.
     * @param userId The ID of the user expected to own the asset.
     * @param assetId The ID of the asset to verify.
     * @returns A promise that resolves to true when the asset belongs to the user, or false otherwise.
     */
    async assetBelongsToUser(userId: string, assetId: string): Promise<boolean> {
        return Boolean(
            await prisma.asset.findFirst({
                where: { id: assetId, userId, deletedAt: null },
                select: { id: true }
            })
        )
    }

    /**
     * Verifies that the specified financial account exists and is owned by the user, preventing cross-tenant references when linking transactions.
     * @param userId The ID of the user expected to own the financial account.
     * @param financialAccountId The ID of the financial account to verify.
     * @returns A promise that resolves to true when the financial account belongs to the user, or false otherwise.
     */
    async financialAccountBelongsToUser(userId: string, financialAccountId: string): Promise<boolean> {
        return Boolean(
            await prisma.financialAccount.findFirst({
                where: { id: financialAccountId, userId, deletedAt: null },
                select: { id: true }
            })
        )
    }
}
