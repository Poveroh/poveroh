import { AccountType } from './account.js'
import { TransactionAction } from './transaction.js'

export type StringFilter = { equals?: string; contains?: string }
export type DateFilter = { gte?: string; lte?: string }
export type NumberFilter = { equals?: number; gte?: number; lte?: number }

export interface IFilterOptions {
    skip?: number
    take?: number
}

export interface IImportsFilters {
    id?: string
    title?: StringFilter
}

export interface ITransactionFilters {
    id?: string
    title?: StringFilter
    note?: StringFilter
    type?: TransactionAction
    categoryId?: string
    subcategoryId?: string
    accountId?: string
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
    categoryId?: string
}

export interface IAccountFilters {
    id?: string
    title?: StringFilter
    description?: StringFilter
    type?: AccountType
}

export interface ISubscriptionFilters {
    id?: string
    title?: StringFilter
    description?: StringFilter
    accountId?: string
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
