import { TransactionAction, TransactionActionSimple } from './transaction.js'

export type categoryModelMode = 'category' | 'subcategory'

export interface ISubcategoryBase {
    category_id: string
    title: string
    description?: string
    logo_icon: string
}

export interface ISubcategory extends ISubcategoryBase {
    id: string
    created_at: string
}

export interface ICategoryBase {
    title: string
    description?: string
    for: TransactionActionSimple
    logo_icon: string
}

export interface ICategory extends ICategoryBase {
    id: string
    user_id: string
    subcategories: ISubcategory[]
    created_at: string
}

export const defaultCategory: ICategory = {
    id: '',
    user_id: '',
    title: '',
    description: '',
    for: TransactionAction.EXPENSES,
    logo_icon: '',
    subcategories: [],
    created_at: ''
}
