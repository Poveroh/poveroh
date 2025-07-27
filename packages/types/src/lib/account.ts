export interface IAccountBase {
    title: string
    description: string
    type: AccountType
    logoIcon: string
}

export interface IAccount extends IAccountBase {
    id: string
    userId: string
    createdAt: string
}

export enum AccountType {
    ONLINE_BANK = 'ONLINE_BANK',
    BANK_ACCOUNT = 'BANK_ACCOUNT',
    DEPOSIT_BANK = 'DEPOSIT_BANK',
    CIRCUIT = 'CIRCUIT',
    BROKER = 'BROKER'
}
