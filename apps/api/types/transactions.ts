import { Prisma, Currency, TransactionAction as PrismaTransactionAction } from '@prisma/client'
import { components } from '../src/generated/openapi'

// OpenAPI types
export type Transaction = components['schemas']['Transaction']
export type Category = components['schemas']['Category']

// Type for transaction with amounts included
export type TransactionWithAmounts = Prisma.TransactionGetPayload<{
    include: { amounts: true }
}>

// Internal helper types for transaction processing
export type IAmountBase = {
    transactionId: string
    amount: number
    currency: Currency
    action: PrismaTransactionAction
    financialAccountId: string
}

export type ITransactionBase = {
    title: string
    action: PrismaTransactionAction
    date: Date | string
    note?: string | null
    ignore?: boolean
    categoryId?: string | null
    subcategoryId?: string | null
}
