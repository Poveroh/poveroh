import { TransactionAction, TransactionActionSimple } from './transaction.js'

export type CategoryModelMode = 'category' | 'subcategory'

export interface ISubcategoryBase {
    categoryId: string
    title: string
    description?: string
    logoIcon: string
}

export interface ISubcategory extends ISubcategoryBase {
    id: string
    createdAt: string
}

export interface ICategoryBase {
    title: string
    description?: string
    for: TransactionActionSimple
    logoIcon: string
    color: string
}

export interface ICategory extends ICategoryBase {
    id: string
    userId: string
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
