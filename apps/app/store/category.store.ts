import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import { ICategory, ISubcategory } from '@poveroh/types'

type CategoryStore = {
    categoryCacheList: ICategory[]
    addCategory: (category: ICategory) => void
    editCategory: (category: ICategory) => void
    setCategory: (category: ICategory[]) => void
    removeCategory: (categoryId: string) => void
    getCategory: (categoryId: string) => ICategory | null

    // --- Subcategory Actions ---
    addSubcategory: (subcategory: ISubcategory) => void
    editSubcategory: (subcategory: ISubcategory) => void
    removeSubcategory: (subcategoryId: string) => void
    getSubcategory: (subcategoryId: string) => ISubcategory | null
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
                categoryCacheList: list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
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

    // --- Subcategory Actions ---

    addSubcategory: subcategory => {
        set(state => {
            const index = state.categoryCacheList.findIndex(cat => cat.id === subcategory.categoryId)

            if (index === -1) {
                return state
            }

            const list = cloneDeep(state.categoryCacheList)

            list.at(index)?.subcategories.push(subcategory)
            list.at(index)?.subcategories.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

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

            const indexSub = list.at(indexCat)?.subcategories.findIndex(sub => sub.id === subcategory.id)

            if (indexSub === undefined || indexSub === -1 || !list[indexCat]) {
                return state
            }

            list[indexCat].subcategories[indexSub] = subcategory

            list.at(indexCat)?.subcategories.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

            return { categoryCacheList: list }
        })
    },

    removeSubcategory: subcategoryId => {
        set(state => {
            const updated = state.categoryCacheList.map(category => {
                const hasSub = category.subcategories.some(sub => sub.id === subcategoryId)
                if (!hasSub) return category

                return {
                    ...category,
                    subcategories: category.subcategories
                        .filter(sub => sub.id !== subcategoryId)
                        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                }
            })

            return { categoryCacheList: updated }
        })
    },

    getSubcategory: subcategoryId => {
        const arr = get().categoryCacheList

        return arr.flatMap(x => x.subcategories).find(x => x.id === subcategoryId) || null
    }
}))
