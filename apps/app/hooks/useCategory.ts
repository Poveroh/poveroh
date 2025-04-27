'use client'

import { CategoryService, SubcategoryService } from '@/services/category.service'
import { useCategoryStore } from '@/store/category.store'
import { ICategory } from '@poveroh/types'

export const useCategory = () => {
    const categoryService = new CategoryService()
    const subcategoryService = new SubcategoryService()

    const categoryStore = useCategoryStore()

    //category
    const addCategory = async (data: FormData) => {
        const resAccount = await categoryService.add(data)

        categoryStore.addCategory(resAccount)

        return resAccount
    }

    const editCategory = async (data: FormData) => {
        const resAccount = await categoryService.save(data)

        categoryStore.editCategory(resAccount)

        return resAccount
    }

    const removeCategory = async (Category_id: string) => {
        const res = await categoryService.delete(Category_id)

        if (!res) {
            throw new Error('Error deleting category')
        }

        categoryStore.removeCategory(Category_id)

        return res
    }

    const getCategory = async (Category_id: string, fetchFromServer?: boolean) => {
        return fetchFromServer
            ? await categoryService.read<ICategory | null>({ id: Category_id })
            : categoryStore.getCategory(Category_id)
    }

    //subcategory
    const addSubcategory = async (data: FormData) => {
        const res = await subcategoryService.add(data)

        categoryStore.addSubcategory(res)

        return res
    }

    const editSubcategory = async (data: FormData) => {
        const res = await subcategoryService.save(data)

        categoryStore.editSubcategory(res)

        return res
    }

    const removeSubcategory = async (category_id: string) => {
        const res = await subcategoryService.delete(category_id)

        if (!res) {
            throw new Error('Error deleting category')
        }

        categoryStore.removeCategory(category_id)

        return res
    }

    const getSubcategory = async (category_id: string, fetchFromServer?: boolean) => {
        return fetchFromServer
            ? await subcategoryService.read<ICategory | null>({ id: category_id })
            : categoryStore.getSubcategory(category_id)
    }

    const fetchCategory = async () => {
        const res = await categoryService.read<ICategory[]>()

        categoryStore.setCategory(res)

        return res
    }

    return {
        categoryCacheList: categoryStore.categoryCacheList,
        addCategory,
        editCategory,
        removeCategory,
        getCategory,
        fetchCategory,

        addSubcategory,
        editSubcategory,
        removeSubcategory,
        getSubcategory
    }
}
