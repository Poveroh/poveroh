import { BankAccountType } from './bankaccount.js'
import { CyclePeriod } from './subscription.js'
import { TransactionAction } from './transaction.js'

export type StringFilter = { equals?: string; contains?: string }
export type DateFilter = { gte?: string; lte?: string }
export type NumberFilter = { equals?: number; gte?: number; lte?: number }

export interface ITransactionFilters {
    id?: string
    title?: StringFilter
    note?: StringFilter
    type?: TransactionAction
    category_id?: string
    subcategory_id?: string
    bank_account_id?: string
    date?: DateFilter
    fromDate?: string
}

export interface ICategoryFilters {
    id?: string
    title?: StringFilter
    description?: StringFilter
    for?: TransactionAction
}

export interface ISubcategoryFilters {
    id?: string
    title?: StringFilter
    description?: StringFilter
    category_id?: string
}

export interface IBankAccountFilters {
    id?: string
    title?: StringFilter
    description?: StringFilter
    type?: BankAccountType
}

export interface ISubscriptionFilters {
    id?: string
    title?: StringFilter
    description?: StringFilter
    bank_account_id?: string
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
          options: { label: string; value: string }[]
      }
