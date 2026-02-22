import { TransactionAction } from './transaction.js'

// Category-related types used in UI and business logic

export type CategoryModelMode = 'category' | 'subcategory'

// Default category for form initialization
export const defaultCategory = {
    id: '',
    userId: '',
    title: '',
    description: '',
    for: TransactionAction.EXPENSES as TransactionAction.EXPENSES | TransactionAction.INCOME,
    logoIcon: '',
    color: '#8B5CF6',
    subcategories: [],
    createdAt: ''
}
