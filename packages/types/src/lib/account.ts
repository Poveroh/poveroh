export interface IFinancialAccountBase {
    title: string
    description: string
    type: FinancialAccountType
    logoIcon: string
}

export interface IFinancialAccount extends IFinancialAccountBase {
    id: string
    userId: string
    createdAt: string
}

export enum FinancialAccountType {
    ONLINE_BANK = 'ONLINE_BANK',
    BANK_ACCOUNT = 'BANK_ACCOUNT',
    DEPOSIT_BANK = 'DEPOSIT_BANK',
    CIRCUIT = 'CIRCUIT',
    BROKER = 'BROKER'
}
