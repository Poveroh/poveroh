import { FinancialAccountTypeEnum, TransactionData } from './contracts.js'
import { Item } from './item.js'

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

export type GroupedTransactions = Record<string, TransactionData[]>

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
