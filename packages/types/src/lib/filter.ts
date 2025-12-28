import { FinancialAccountType } from './account.js'
import { TransactionAction } from './transaction.js'

export type StringFilter = { equals?: string; contains?: string }
export type DateFilter = { gte?: string; lte?: string }
export type NumberFilter = { equals?: number; gte?: number; lte?: number }

export interface IFilterOptions {
    skip?: number
    take?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
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
    financialAccountId?: string
    date?: DateFilter
    [key: string]: string | StringFilter | DateFilter | TransactionAction | undefined
}

export interface ICategoryFilters {
    id?: string
    title?: StringFilter
    description?: StringFilter
    for?: TransactionAction
    [key: string]: string | StringFilter | TransactionAction | undefined
}

export interface ISubcategoryFilters {
    id?: string
    title?: StringFilter
    description?: StringFilter
    categoryId?: string
    [key: string]: string | StringFilter | undefined
}

export interface IFinancialAccountFilters {
    id?: string
    title?: StringFilter
    description?: StringFilter
    type?: FinancialAccountType
    [key: string]: string | StringFilter | FinancialAccountType | undefined
}

export interface ISubscriptionFilters {
    id?: string
    title?: StringFilter
    description?: StringFilter
    financialAccountId?: string
    [key: string]: string | StringFilter | undefined
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
    | {
          fromName: string
          toName: string
          label: string
          type: 'dateRange'
      }
