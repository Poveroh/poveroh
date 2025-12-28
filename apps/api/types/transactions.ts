import { Prisma } from '@prisma/client'

// Type for transaction with amounts included
export type TransactionWithAmounts = Prisma.TransactionGetPayload<{
    include: { amounts: true }
}>
