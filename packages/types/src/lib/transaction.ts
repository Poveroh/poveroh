export interface IAmount {
    amount: number
    currency_id: string
    action: TransactionAction
    created_at: string
}

export interface ITransaction {
    id: string
    title: string
    type: TransactionAction
    category_id: string
    subcategory_id: string
    amounts: IAmount[]
    note?: string
    ignore: boolean
    created_at: Date
}

export enum TransactionAction {
    INTERNAL = 'INTERNAL',
    INCOME = 'INCOME',
    EXPENSES = 'EXPENSES'
}

export type TransactionActionSimple = Exclude<TransactionAction, TransactionAction.INTERNAL>
