import { Prisma } from '@prisma/client'

//TODO: This is a workaround to avoid importing the entire Prisma namespace in the transaction service, which causes type issues. We should refactor the transaction service to avoid this in the future.
export type TransactionWithAmounts = any
// Prisma.TransactionGetPayload<{
//     include: { amounts: true }
// }>
