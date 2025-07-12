import { Currencies } from './currency.js'
import { ITransaction, TransactionAction, TransactionStatus } from './transaction.js'

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
    date: Date
    amount: number
    type: TransactionAction
    currency: Currencies
    title: string
    originalRow?: Record<string, any>
}

export interface IImportsFile {
    id: string
    import_id: string
    filename: string
    filetype: FileType
    path: string
    created_at: string
}

export interface IImports {
    id: string
    user_id: string
    title: string
    status: TransactionStatus
    created_at: string
    files: IImportsFile[]
    transactions: ITransaction[]
}

export enum FileType {
    CSV = 'CSV',
    PDF = 'PDF'
}
