import { Prisma } from '@prisma/client'

export type TransactionWithAmounts = Prisma.TransactionGetPayload<{
    include: { amounts: true }
}>
