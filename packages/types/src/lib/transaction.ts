export interface ITransactionBankAccountTransfer {
    from: string
    to: string
}

export interface ITransaction {
    name: string
    date: string
    logo?: string
    action: TransactionAction
    amount: number
    currency: string
    bankAccount: ITransactionBankAccountTransfer | string | []
    category: string
    subcategory: string
}

export enum TransactionAction {
    INTERNAL = 'INTERNAL',
    INCOME = 'INCOME',
    EXPENSES = 'EXPENSES'
}
