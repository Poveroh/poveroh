export interface IBankAccountBase {
    title: string
    description: string
    type: BankAccountType
    logo_icon: string
}

export interface IBankAccount extends IBankAccountBase {
    id: string
    created_at: string
}

export enum BankAccountType {
    ONLINE_BANK = 'ONLINE_BANK',
    BANK_ACCOUNT = 'BANK_ACCOUNT',
    DEPOSIT_BANK = 'DEPOSIT_BANK',
    CIRCUIT = 'CIRCUIT',
    BROKER = 'BROKER'
}
