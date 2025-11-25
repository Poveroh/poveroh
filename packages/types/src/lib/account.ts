export interface IFinancialAccountBase {
    title: string
    description: string
    type: FinancialAccountType
    logoIcon: string
    balance: number
}

export interface IFinancialAccount extends IFinancialAccountBase {
    id: string
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
