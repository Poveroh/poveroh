import { z } from '../zod'

/**
 * Snapshot account balance schema linking a snapshot to the financial account's balance point of that day (no copied value)
 */
export const SnapshotAccountBalanceSchema = z
    .object({
        id: z.string().uuid(),
        snapshotId: z.string().uuid(),
        accountId: z.string().uuid().nullable(),
        financialAccountBalanceId: z.string().uuid().nullable()
    })
    .openapi('SnapshotAccountBalance')

/**
 * Snapshot asset value schema representing the value of a specific asset at the time of a snapshot
 */
export const SnapshotAssetValueSchema = z
    .object({
        id: z.string().uuid(),
        snapshotId: z.string().uuid(),
        assetId: z.string().uuid(),
        quantity: z.number(),
        unitPrice: z.number(),
        totalValue: z.number()
    })
    .openapi('SnapshotAssetValue')

/**
 * Snapshot schema representing a financial snapshot of a user's accounts and assets at a specific point in time
 */
export const SnapshotSchema = z
    .object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        snapshotDate: z.string().datetime(),
        note: z.string().nullable(),
        totalCash: z.number(),
        totalInvestments: z.number(),
        totalNetWorth: z.number(),
        accountBalances: SnapshotAccountBalanceSchema.array(),
        assetValues: SnapshotAssetValueSchema.array(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().optional()
    })
    .openapi('Snapshot')

/**
 * Snapshot schema representing a financial snapshot of a user's accounts and assets at a specific point in time
 */
export const SnapshotDataSchema = SnapshotSchema.omit({
    userId: true,
    deletedAt: true
}).openapi('SnapshotData')
