import { Currencies } from './currency.js'

export interface IAmountBase {
    transaction_id: string
    amount: number
    currency: Currencies
    action: TransactionAction
    bank_account_id: string
}

export interface IAmount extends IAmountBase {
    id: string
    created_at: string
}

export interface ICsvReadedTransaction {
    date: Date
    amount: number
    type: TransactionAction
    currency: Currencies
    title: string
    originalRow?: Record<string, any>
}

export interface ITransactionBase {
    title: string
    type: TransactionAction
    category_id?: string
    subcategory_id?: string
    icon?: string
    date: string
    note?: string
    ignore: boolean
}

export interface ITransaction extends ITransactionBase {
    id: string
    user_id: string
    created_at: Date
    amounts: IAmount[]
}

export enum TransactionAction {
    INTERNAL = 'INTERNAL',
    INCOME = 'INCOME',
    EXPENSES = 'EXPENSES'
}

export type TransactionActionSimple = Exclude<TransactionAction, TransactionAction.INTERNAL>
export type GroupedTransactions = Record<string, ITransaction[]>
