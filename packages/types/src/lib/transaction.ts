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
