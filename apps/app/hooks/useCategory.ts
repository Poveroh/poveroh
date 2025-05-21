'use client'

import { CategoryService, SubcategoryService } from '@/services/category.service'
import { useCategoryStore } from '@/store/category.store'
import { ICategory, ICategoryFilters } from '@poveroh/types'
import { useError } from './useError'

export const useCategory = () => {
    const { handleError } = useError()

    const categoryService = new CategoryService()
    const subcategoryService = new SubcategoryService()
    const categoryStore = useCategoryStore()

    // Category
    const addCategory = async (data: FormData) => {
        try {
            const res = await categoryService.add(data)
            categoryStore.addCategory(res)

            return res
        } catch (error) {
            return handleError(error, 'Error adding category')
        }
    }

    const editCategory = async (id: string, data: FormData) => {
        try {
            const res = await categoryService.save(id, data)
            categoryStore.editCategory(res)

            return res
        } catch (error) {
            return handleError(error, 'Error editing category')
        }
    }

    const removeCategory = async (categoryId: string) => {
        try {
            const res = await categoryService.delete(categoryId)

            if (!res) {
                throw new Error('No response from server')
            }

            categoryStore.removeCategory(categoryId)

            return res
        } catch (error) {
            return handleError(error, 'Error deleting category')
        }
    }

    const getCategory = async (categoryId: string, fetchFromServer?: boolean) => {
        try {
            return fetchFromServer
                ? await categoryService.read<ICategory | null, ICategoryFilters>({ id: categoryId })
                : categoryStore.getCategory(categoryId)
        } catch (error) {
            return handleError(error, 'Error fetching category')
        }
    }

    // Subcategory methods
    const addSubcategory = async (data: FormData) => {
        try {
            const res = await subcategoryService.add(data)
            categoryStore.addSubcategory(res)

            return res
        } catch (error) {
            return handleError(error, 'Error adding subcategory')
        }
    }

    const editSubcategory = async (id: string, data: FormData) => {
        try {
            const res = await subcategoryService.save(id, data)
            categoryStore.editSubcategory(res)

            return res
        } catch (error) {
            return handleError(error, 'Error editing subcategory')
        }
    }

    const removeSubcategory = async (subcategoryId: string) => {
        try {
            const res = await subcategoryService.delete(subcategoryId)

            if (!res) {
                throw new Error('No response from server')
            }

            categoryStore.removeCategory(subcategoryId)

            return res
        } catch (error) {
            return handleError(error, 'Error deleting subcategory')
        }
    }

    const getSubcategory = async (subcategoryId: string, fetchFromServer?: boolean) => {
        try {
            return fetchFromServer
                ? await subcategoryService.read<ICategory | null, ICategoryFilters>({ id: subcategoryId })
                : categoryStore.getSubcategory(subcategoryId)
        } catch (error) {
            return handleError(error, 'Error fetching subcategory')
        }
    }

    const fetchCategory = async () => {
        try {
            const res = await categoryService.read<ICategory[], ICategoryFilters>()
            categoryStore.setCategory(res)

            return res
        } catch (error) {
            return handleError(error, 'Error fetching categories')
        }
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
