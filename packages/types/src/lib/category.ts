import { Category } from './contracts.js'

export type CategoryModelMode = 'category' | 'subcategory'

export const defaultCategory: Category = {
    id: '',
    userId: '',
    title: '',
    for: 'EXPENSES',
    icon: '',
    color: '#8B5CF6',
    subcategories: [],
    createdAt: '',
    updatedAt: ''
}
