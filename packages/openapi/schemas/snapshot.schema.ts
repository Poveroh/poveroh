import { z } from '../zod'
import { SuccessResponseSchema } from './response.schema'

/**
 * Snapshot account balance schema representing the balance of a specific financial account at the time of a snapshot
 */
export const SnapshotAccountBalanceSchema = z
    .object({
        id: z.string().uuid(),
        snapshotId: z.string().uuid(),
        accountId: z.string().uuid(),
        balance: z.number()
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
        updatedAt: z.string().datetime()
    })
    .openapi('Snapshot')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for creating a new snapshot account balance
 */
export const CreateSnapshotAccountBalanceRequestSchema = z
    .object({
        balance: z.string().uuid(),
        snapshotDate: z.string().datetime(),
        accountId: z.string().uuid(),
        note: z.string()
    })
    .openapi('CreateSnapshotAccountBalanceRequest')

/**
 * Response schema for creating a new snapshot account balance
 */
export const CreateSnapshotAccountBalanceResponseSchema = SuccessResponseSchema(SnapshotSchema).openapi(
    'CreateSnapshotAccountBalanceResponse'
)
