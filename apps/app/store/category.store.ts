import { create } from 'zustand'
import { remove } from 'lodash'
import { ICategory, ISubcategory } from '@poveroh/types'

type CategoryStore = {
    categoryCacheList: ICategory[]
    addCategory: (category: ICategory) => void
    editCategory: (category: ICategory) => void
    setCategory: (category: ICategory[]) => void
    removeCategory: (category_id: string) => void
    getCategory: (category_id: string) => ICategory | null

    // --- Subcategory Actions ---
    addSubcategory: (subcategory: ISubcategory) => void
    editSubcategory: (subcategory: ISubcategory) => void
    removeSubcategory: (subcategory_id: string) => void
    getSubcategory: (subcategory_id: string) => ISubcategory | null
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
    categoryCacheList: [],
    addCategory: category => {
        set(state => ({
            categoryCacheList: [...state.categoryCacheList, category].sort((a, b) =>
                a.created_at < b.created_at ? 1 : -1
            )
        }))
    },
    editCategory: category => {
        set(state => {
            const index = state.categoryCacheList.findIndex(item => item.id === category.id)

            if (index === -1) {
                return state
            }

            const list = structuredClone(state.categoryCacheList)
            list[index] = category

            return {
                categoryCacheList: list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
            }
        })
    },
    setCategory: categories => {
        set(() => ({
            categoryCacheList: categories
        }))
    },
    removeCategory: category_id => {
        set(state => {
            const list = structuredClone(state.categoryCacheList)
            remove(list, item => item.id === category_id)

            return { categoryCacheList: list }
        })
    },
    getCategory: category_id => {
        const list = get().categoryCacheList
        return list.find(item => item.id === category_id) || null
    },

    // --- Subcategory Actions ---

    addSubcategory: subcategory => {
        set(state => {
            const index = state.categoryCacheList.findIndex(cat => cat.id === subcategory.category_id)

            if (index === -1) {
                return state
            }

            const list = structuredClone(state.categoryCacheList)

            list.at(index)?.subcategories.push(subcategory)
            list.at(index)?.subcategories.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))

            return { categoryCacheList: list }
        })
    },

    editSubcategory: subcategory => {
        set(state => {
            const indexCat = state.categoryCacheList.findIndex(cat => cat.id === subcategory.category_id)

            if (indexCat === -1) {
                return state
            }

            const list = structuredClone(state.categoryCacheList)

            const indexSub = list.at(indexCat)?.subcategories.findIndex(sub => sub.id == subcategory.id)

            if (indexSub !== -1 || !indexSub || !list[indexCat]) {
                return state
            }

            list[indexCat].subcategories[indexSub] = subcategory

            list.at(indexCat)?.subcategories.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))

            return { categoryCacheList: list }
        })
    },

    removeSubcategory: subcategory_id => {
        set(state => {
            const subcategory = state.categoryCacheList.flatMap(x => x.subcategories).find(x => x.id == subcategory_id)

            if (!subcategory) {
                return state
            }

            const indexCat = state.categoryCacheList.findIndex(cat => cat.id === subcategory.category_id)

            if (indexCat === -1) {
                return state
            }

            const list = structuredClone(state.categoryCacheList)

            const subcategories = list[indexCat]?.subcategories

            if (!subcategories) {
                return state
            }

            remove(subcategories, sub => sub.id == subcategory.id)

            subcategories.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))

            return { categoryCacheList: list }
        })
    },

    getSubcategory: subcategory_id => {
        const arr = get().categoryCacheList

        return arr.flatMap(x => x.subcategories).find(x => x.id == subcategory_id) || null
    }
}))
