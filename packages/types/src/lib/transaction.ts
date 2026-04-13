import { CurrencyEnum, FinancialAccountTypeEnum, TransactionActionEnum, TransactionData } from './contracts.js'
import { Item } from './item.js'

export type GroupedTransactions = Record<string, TransactionData[]>

/**
 * Unified transaction form data type used by the frontend form hook.
 * The `amounts` array uses TransactionAmount structure:
 * - INCOME: 1 amount with action INCOME
 * - EXPENSES: 1+ amounts with action EXPENSES (supports split)
 * - TRANSFER: 2 amounts — one EXPENSES (from), one INCOME (to)
 */
export type TransactionFormData = {
    title: string
    date: string
    categoryId: string
    subcategoryId: string
    note: string
    ignore: boolean
    action: TransactionActionEnum
    currency: CurrencyEnum | string
    amounts: Array<{
        amount: number
        action: TransactionActionEnum
        financialAccountId: string
    }>
}

export type FilterField =
    | {
          name: string
          label: string
          type: 'text' | 'date'
      }
    | {
          name: string
          label: string
          type: 'select'
          options: Item[]
      }
    | {
          fromName: string
          toName: string
          label: string
          type: 'dateRange'
      }

export const ACCOUNT_TYPE_CATALOG: Item<FinancialAccountTypeEnum>[] = [
    { value: 'ONLINE_BANK', label: 'accounts.types.online' },
    { value: 'BANK_ACCOUNT', label: 'accounts.types.bank' },
    { value: 'CIRCUIT', label: 'accounts.types.circuit' },
    { value: 'DEPOSIT_BANK', label: 'accounts.types.deposit' },
    { value: 'BROKER', label: 'accounts.types.broker' },
    { value: 'WALLET', label: 'accounts.types.wallet' },
    { value: 'CASH', label: 'accounts.types.cash' },
    { value: 'CREDIT_CARD', label: 'accounts.types.creditCard' },
    { value: 'OTHER', label: 'accounts.types.other' }
]
