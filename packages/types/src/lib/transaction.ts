import { Currencies } from './currency.js'

// Transaction enums - used throughout the application
export enum TransactionAction {
    INCOME = 'INCOME',
    EXPENSES = 'EXPENSES',
    TRANSFER = 'TRANSFER'
}

export enum TransactionStatus {
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    IMPORT_PENDING = 'IMPORT_PENDING',
    IMPORT_REJECTED = 'IMPORT_REJECTED',
    IMPORT_APPROVED = 'IMPORT_APPROVED'
}

// Form data types - used in UI forms
type ExpensesAmounts = Array<{ amount: number; financialAccountId: string }>

export type ExpensesFormData = {
    title: string
    date: string
    categoryId: string
    subcategoryId: string
    note: string
    ignore: boolean
    currency: string
    totalAmount: number
    multipleAmount: boolean
    amounts?: ExpensesAmounts
    totalFinancialAccountId?: string
}

export type IncomeFormData = {
    title: string
    date: string
    categoryId: string
    subcategoryId: string
    note: string
    ignore: boolean
    amount: number
    currency: string
    financialAccountId: string
}

export type TransferFormData = {
    title: string
    date: string
    note: string
    ignore: boolean
    amount: number
    currency: string
    from: string
    to: string
}

export type FormMode = ExpensesFormData | IncomeFormData | TransferFormData
