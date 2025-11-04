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
    action: TransactionAction
    currency: Currencies
    title: string
    originalRow?: Record<string, any>
}

export interface IImportsFile {
    id: string
    importId: string
    filename: string
    filetype: FileType
    path: string
    createdAt: string
}

export interface IImport {
    id: string
    userId: string
    title: string
    status: TransactionStatus
    createdAt: string
    financialAccountId: string
    files: IImportsFile[]
    transactions: ITransaction[]
}

export enum FileType {
    CSV = 'CSV',
    PDF = 'PDF'
}
