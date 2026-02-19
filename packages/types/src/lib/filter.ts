import { FinancialAccountType } from './account.js'
import { IItem } from './item.js'
import { TransactionAction } from './transaction.js'

export type StringFilter = { equals?: string; contains?: string }
export type DateFilter = { gte?: string; lte?: string }
export type NumberFilter = { equals?: number; gte?: number; lte?: number }

export type CategoryFilterTypes = string | StringFilter | TransactionAction | undefined
export type TransactionsFilterTypes = string | StringFilter | DateFilter | TransactionAction | undefined
export type SubcategoryFilterTypes = string | StringFilter | undefined
export type FinancialAccountFilterTypes = string | StringFilter | FinancialAccountType | undefined

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
    [key: string]: TransactionsFilterTypes
}

export interface ICategoryFilters {
    id?: string
    title?: StringFilter
    description?: StringFilter
    for?: TransactionAction
    [key: string]: CategoryFilterTypes
}

export interface ISubcategoryFilters {
    id?: string
    title?: StringFilter
    description?: StringFilter
    categoryId?: string
    [key: string]: SubcategoryFilterTypes
}

export interface IFinancialAccountFilters {
    id?: string
    title?: StringFilter
    description?: StringFilter
    type?: FinancialAccountType
    [key: string]: FinancialAccountFilterTypes
}

export interface ISubscriptionFilters {
    id?: string
    title?: StringFilter
    description?: StringFilter
    financialAccountId?: string
    [key: string]: string | StringFilter | undefined
}

export interface INetWorthEvolutionFilters {
    date: DateFilter
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
          options: IItem[]
      }
    | {
          fromName: string
          toName: string
          label: string
          type: 'dateRange'
      }
