import { TransactionActionEnum, CurrencyEnum } from './contracts.js'

export type FieldMapping = {
    date?: string
    amount?: string
    currency?: string
    title?: string
    confidence: number
    dateFallbacks?: string[]
    amountFallbacks?: string[]
    currencyFallbacks?: string[]
    titleFallbacks?: string[]
}

export type ValueReturned = {
    transactions: ReadedTransaction[]
    mapping: FieldMapping
    errors: string[]
    detectedStartRow?: number
    summary: {
        totalTransactions: number
        totalIncome: number
        totalExpenses: number
    }
}

export type ReadedTransaction = {
    date: string
    amount: number
    action: TransactionActionEnum
    currency: CurrencyEnum
    title: string
    originalRow?: Record<string, any>
}
