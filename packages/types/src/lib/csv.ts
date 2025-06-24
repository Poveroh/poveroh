import { ICsvReadedTransaction } from './transaction.js'

export interface IFieldMapping {
    date?: string
    amount?: string
    currency?: string
    title?: string
    confidence: number
}

export interface ICSVValueReturned {
    transactions: ICsvReadedTransaction[]
    mapping: IFieldMapping
    errors: string[]
    detectedStartRow?: number
    summary: {
        totalTransactions: number
        totalIncome: number
        totalExpenses: number
    }
}
