import { Category } from './contracts.js'

export type CategoryModelMode = 'category' | 'subcategory'

export const defaultCategory: Category = {
    id: '',
    userId: '',
    title: '',
    for: 'EXPENSES',
    logoIcon: '',
    color: '#8B5CF6',
    subcategories: [],
    createdAt: '',
    updatedAt: ''
}
