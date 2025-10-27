import { Currencies } from './currency.js'

export interface IAmountBase {
    transactionId: string
    amount: number
    currency: Currencies
    action: TransactionAction
    accountId: string
}

export interface IAmount extends IAmountBase {
    id: string
    createdAt: string
}

export interface ITransactionBase {
    title: string
    action: TransactionAction
    categoryId?: string
    subcategoryId?: string
    icon?: string
    date: string
    note?: string
    ignore: boolean
}

export interface ITransaction extends ITransactionBase {
    id: string
    userId: string
    createdAt: Date
    status: TransactionStatus
    importId?: string
    amounts: IAmount[]
}

type ExpensesAmounts = Array<{ amount: number; accountId: string }>

export type ExpensesFormData = {
    title: string
    date: string
    currency: string
    totalAmount: number
    multipleAmount: boolean
    amounts?: ExpensesAmounts
    totalAccountId?: string
    categoryId: string
    subcategoryId: string
    note: string
    ignore: boolean
}

export type IncomeFormData = {
    title: string
    date: string
    amount: number
    currency: string
    accountId: string
    categoryId: string
    subcategoryId: string
    note: string
    ignore: boolean
}

export type TransferFormData = {
    title: string
    date: string
    amount: number
    currency: string
    from: string
    to: string
    note: string
    ignore: boolean
}

export type FormMode = ExpensesFormData | IncomeFormData | TransferFormData

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

export type TransactionActionSimple = Exclude<TransactionAction, TransactionAction.TRANSFER>
export type GroupedTransactions = Record<string, ITransaction[]>
