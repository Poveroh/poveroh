import { IItem } from './item.js'

// Generic filter types for UI components
export type StringFilter = { equals?: string; contains?: string }
export type DateFilter = { gte?: string; lte?: string }
export type NumberFilter = { equals?: number; gte?: number; lte?: number }

// Filter options for pagination and sorting
export interface IFilterOptions {
    skip?: number
    take?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

// Filter field types for UI form generation
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
