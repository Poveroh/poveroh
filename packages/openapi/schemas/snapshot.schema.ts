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
