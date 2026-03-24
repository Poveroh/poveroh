import { TransactionData } from './contracts.js'
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
