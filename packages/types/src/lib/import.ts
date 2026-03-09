import { TransactionActionEnum, CurrencyEnum } from 'src/contracts'

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
    action: TransactionActionEnum
    currency: CurrencyEnum
    title: string
    originalRow?: Record<string, any>
}
