import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import { CategoryData, SubcategoryData } from '@poveroh/types/contracts'

type CategoryStore = {
    categoryCacheList: CategoryData[]
    addCategory: (category: CategoryData) => void
    editCategory: (category: CategoryData) => void
    setCategory: (category: CategoryData[]) => void
    removeCategory: (categoryId: string) => void
    getCategory: (categoryId: string) => CategoryData | null
    clearCategory: () => void

    // --- Subcategory Actions ---
    addSubcategory: (subcategory: SubcategoryData) => void
    editSubcategory: (subcategory: SubcategoryData) => void
    removeSubcategory: (subcategoryId: string) => void
    getSubcategory: (subcategoryId: string) => SubcategoryData | null
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
    categoryCacheList: [],
    addCategory: category => {
        set(state => ({
            categoryCacheList: [...state.categoryCacheList, category].sort((a, b) =>
                a.createdAt < b.createdAt ? 1 : -1
            )
        }))
    },
    editCategory: category => {
        set(state => {
            const index = state.categoryCacheList.findIndex(item => item.id === category.id)

            if (index === -1) {
                return state
            }

            const list = cloneDeep(state.categoryCacheList)
            list[index] = { ...list[index], ...category }

            return {
                categoryCacheList: list
            }
        })
    },
    setCategory: categories => {
        set(() => ({
            categoryCacheList: categories
        }))
    },
    removeCategory: categoryId => {
        set(state => ({
            categoryCacheList: state.categoryCacheList.filter(item => item.id !== categoryId)
        }))
    },
    getCategory: categoryId => {
        const list = get().categoryCacheList
        return list.find(item => item.id === categoryId) || null
    },
    clearCategory: () => {
        set(() => ({
            categoryCacheList: []
        }))
    },

    // --- Subcategory Actions ---

    addSubcategory: subcategory => {
        set(state => {
            const index = state.categoryCacheList.findIndex(cat => cat.id === subcategory.categoryId)

            if (index === -1) {
                return state
            }

            const list = cloneDeep(state.categoryCacheList)

            list.at(index)?.subcategories?.push(subcategory)
            list.at(index)?.subcategories?.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

            return { categoryCacheList: list }
        })
    },

    editSubcategory: subcategory => {
        set(state => {
            const indexCat = state.categoryCacheList.findIndex(cat => cat.id === subcategory.categoryId)

            if (indexCat === -1) {
                return state
            }

            const list = cloneDeep(state.categoryCacheList)

            const indexSub = list.at(indexCat)?.subcategories?.findIndex(sub => sub.id === subcategory.id)

            //TODO: understand why this can be undefined
            if (indexSub === undefined || indexSub === -1 || !list[indexCat] || !list[indexCat].subcategories) {
                return state
            }

            list[indexCat].subcategories[indexSub] = subcategory

            return { categoryCacheList: list }
        })
    },

    removeSubcategory: subcategoryId => {
        set(state => {
            const updated = state.categoryCacheList.map(category => {
                const hasSub = category.subcategories?.some(sub => sub.id === subcategoryId)
                if (!hasSub) return category

                return {
                    ...category,
                    subcategories: category.subcategories
                        ?.filter(sub => sub.id !== subcategoryId)
                        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                }
            })

            return { categoryCacheList: updated }
        })
    },

    getSubcategory: subcategoryId => {
        const arr = get().categoryCacheList

        return arr.flatMap(x => x.subcategories || []).find(x => x.id === subcategoryId) || null
    }
}))
