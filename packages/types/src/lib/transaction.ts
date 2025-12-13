import { Currencies } from './currency.js'

export interface IAmountBase {
    transactionId: string
    amount: number
    currency: Currencies
    action: TransactionAction
    financialAccountId: string
    importReference?: string
}

export interface IAmount extends IAmountBase {
    id: string
    createdAt: string
}

export interface ITransactionMediaBase {
    filename: string
    filetype: string
    path: string
}

export interface ITransactionMedia extends ITransactionMediaBase {
    id: string
    transactionId: string
    createdAt: string
}

export interface ITransferBase {
    transferDate: string
    note?: string
}

export interface ITransfer extends ITransferBase {
    id: string
    userId: string
    fromTransactionId?: string
    toTransactionId?: string
    createdAt: string
    updatedAt: string
}

export type ITransactionBase = {
    title: string
    action: TransactionAction
    categoryId?: string
    subcategoryId?: string
    icon?: string
    date: string
    note?: string | null
    ignore: boolean
}

export interface ITransaction extends ITransactionBase {
    id: string
    userId: string
    createdAt: string
    status: TransactionStatus
    importId?: string
    updatedAt: string
    amounts: IAmount[]
    action: TransactionAction
    media?: ITransactionMedia[]
    transferId?: string
    transferHash?: string
}

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
