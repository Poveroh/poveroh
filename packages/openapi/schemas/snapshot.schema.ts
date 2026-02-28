import { z } from '../zod'

export const SnapshotSchema = z
    .object({
        id: z.string(),
        snapshotDate: z.string().datetime(),
        note: z.string().nullable(),
        totalCash: z.number(),
        totalInvestments: z.number(),
        totalNetWorth: z.number(),
        userId: z.string()
    })
    .openapi('Snapshot')

export const SnapshotRequestSchema = z
    .object({
        snapshotDate: z.string().datetime(),
        note: z.string().nullable().optional(),
        totalCash: z.number().optional(),
        totalInvestments: z.number().optional(),
        totalNetWorth: z.number().optional()
    })
    .openapi('SnapshotRequest')

export const SnapshotResponseSchema = z
    .object({
        data: SnapshotSchema
    })
    .openapi('SnapshotResponse')
