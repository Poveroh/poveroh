import { Currencies, TransactionAction } from '@poveroh/types'

/**
 * Interface for standardized amount data structure
 */
export interface IAmountData {
    transactionId: string
    amount: number
    currency: Currencies
    action: TransactionAction
    financialAccountId: string
}
