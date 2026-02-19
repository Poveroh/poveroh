export interface IFinancialAccount {
    id: string
    title: string
    description: string
    type: FinancialAccountType
    logoIcon: string
    balance: number
    userId: string
    createdAt: string
    updatedAt: string
}

export enum FinancialAccountType {
    ONLINE_BANK = 'ONLINE_BANK',
    BANK_ACCOUNT = 'BANK_ACCOUNT',
    CIRCUIT = 'CIRCUIT',
    DEPOSIT_BANK = 'DEPOSIT_BANK',
    BROKER = 'BROKER',
    WALLET = 'WALLET',
    CASH = 'CASH',
    CREDIT_CARD = 'CREDIT_CARD',
    OTHER = 'OTHER'
}
