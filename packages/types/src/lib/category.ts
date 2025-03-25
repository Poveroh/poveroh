import { TransactionAction } from './transaction.js'

export interface ISubcategoryBase {
    category_id: string
    title: string
    description?: string
    logo_icon: string
}

export interface ISubcategory extends ISubcategoryBase {
    id: string
    created_at: Date
}

export interface ICategoryBase {
    title: string
    description?: string
    for: TransactionAction
    logo_icon: string
}

export interface ICategory extends ICategoryBase {
    id: string
    user_id: string
    subcategories: ISubcategory[]
    created_at: Date
}
