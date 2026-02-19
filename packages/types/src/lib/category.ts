import { TransactionAction } from './transaction.js'

export type CategoryModelMode = 'category' | 'subcategory'

export interface ISubcategory {
    id: string
    categoryId: string
    title: string
    description?: string
    logoIcon: string
    createdAt: string
}

export interface ICategory {
    id: string
    userId: string
    title: string
    description?: string
    for: TransactionAction.EXPENSES | TransactionAction.INCOME
    logoIcon: string
    color: string
    subcategories: ISubcategory[]
    createdAt: string
}

export const defaultCategory: ICategory = {
    id: '',
    userId: '',
    title: '',
    description: '',
    for: TransactionAction.EXPENSES,
    logoIcon: '',
    color: '#8B5CF6',
    subcategories: [],
    createdAt: ''
}
