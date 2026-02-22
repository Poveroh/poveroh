import { Currencies } from './currency.js'
import { TransactionAction } from './transaction.js'

// Import-related types used in UI and business logic

export interface IFieldMapping {
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

export interface IValueReturned {
    transactions: IReadedTransaction[]
    mapping: IFieldMapping
    errors: string[]
    detectedStartRow?: number
    summary: {
        totalTransactions: number
        totalIncome: number
        totalExpenses: number
    }
}

export interface IReadedTransaction {
    date: string
    amount: number
    action: TransactionAction
    currency: Currencies
    title: string
    originalRow?: Record<string, any>
}

export enum FileType {
    CSV = 'CSV',
    PDF = 'PDF'
}
