'use client'

import { CategoryService, SubcategoryService } from '@/services/category.service'
import { useCategoryStore } from '@/store/category.store'
import { ICategory, ICategoryFilters } from '@poveroh/types'
import { useError } from './use-error'
import { useState } from 'react'

type categoryLoadingState = {
    addCategory: boolean
    editCategory: boolean
    removeCategory: boolean
    getCategory: boolean
    fetchCategory: boolean
    addSubcategory: boolean
    editSubcategory: boolean
    removeSubcategory: boolean
    getSubcategory: boolean
}

export const useCategory = () => {
    const { handleError } = useError()

    const categoryService = new CategoryService()
    const subcategoryService = new SubcategoryService()
    const categoryStore = useCategoryStore()

    const [categoryLoading, setCategoryLoading] = useState<categoryLoadingState>({
        addCategory: false,
        editCategory: false,
        removeCategory: false,
        getCategory: false,
        fetchCategory: false,
        addSubcategory: false,
        editSubcategory: false,
        removeSubcategory: false,
        getSubcategory: false
    })

    const setCategoryLoadingFor = (key: keyof categoryLoadingState, value: boolean) => {
        setCategoryLoading(prev => ({ ...prev, [key]: value }))
    }

    // Category
    const addCategory = async (data: FormData) => {
        setCategoryLoadingFor('addCategory', true)
        try {
            const res = await categoryService.add(data)
            categoryStore.addCategory(res)
            return res
        } catch (error) {
            return handleError(error, 'Error adding category')
        } finally {
            setCategoryLoadingFor('addCategory', false)
        }
    }

    const editCategory = async (id: string, data: FormData) => {
        setCategoryLoadingFor('editCategory', true)
        try {
            const res = await categoryService.save(id, data)
            categoryStore.editCategory(res)
            return res
        } catch (error) {
            return handleError(error, 'Error editing category')
        } finally {
            setCategoryLoadingFor('editCategory', false)
        }
    }

    const removeCategory = async (categoryId: string) => {
        setCategoryLoadingFor('removeCategory', true)
        try {
            const res = await categoryService.delete(categoryId)
            if (!res) {
                throw new Error('No response from server')
            }
            categoryStore.removeCategory(categoryId)
            return res
        } catch (error) {
            return handleError(error, 'Error deleting category')
        } finally {
            setCategoryLoadingFor('removeCategory', false)
        }
    }

    const getCategory = async (categoryId: string, fetchFromServer?: boolean) => {
        setCategoryLoadingFor('getCategory', true)
        try {
            return fetchFromServer
                ? await categoryService.read<ICategory | null, ICategoryFilters>({ id: categoryId })
                : categoryStore.getCategory(categoryId)
        } catch (error) {
            return handleError(error, 'Error fetching category')
        } finally {
            setCategoryLoadingFor('getCategory', false)
        }
    }

    // Subcategory methods
    const addSubcategory = async (data: FormData) => {
        setCategoryLoadingFor('addSubcategory', true)
        try {
            const res = await subcategoryService.add(data)
            categoryStore.addSubcategory(res)
            return res
        } catch (error) {
            return handleError(error, 'Error adding subcategory')
        } finally {
            setCategoryLoadingFor('addSubcategory', false)
        }
    }

    const editSubcategory = async (id: string, data: FormData) => {
        setCategoryLoadingFor('editSubcategory', true)
        try {
            const res = await subcategoryService.save(id, data)
            categoryStore.editSubcategory(res)
            return res
        } catch (error) {
            return handleError(error, 'Error editing subcategory')
        } finally {
            setCategoryLoadingFor('editSubcategory', false)
        }
    }

    const removeSubcategory = async (subcategoryId: string) => {
        setCategoryLoadingFor('removeSubcategory', true)
        try {
            const res = await subcategoryService.delete(subcategoryId)
            if (!res) {
                throw new Error('No response from server')
            }
            categoryStore.removeSubcategory(subcategoryId)
            return res
        } catch (error) {
            return handleError(error, 'Error deleting subcategory')
        } finally {
            setCategoryLoadingFor('removeSubcategory', false)
        }
    }

    const getSubcategory = async (subcategoryId: string, fetchFromServer?: boolean) => {
        setCategoryLoadingFor('getSubcategory', true)
        try {
            return fetchFromServer
                ? await subcategoryService.read<ICategory | null, ICategoryFilters>({ id: subcategoryId })
                : categoryStore.getSubcategory(subcategoryId)
        } catch (error) {
            return handleError(error, 'Error fetching subcategory')
        } finally {
            setCategoryLoadingFor('getSubcategory', false)
        }
    }

    const fetchCategory = async (forceRefresh = false) => {
        setCategoryLoadingFor('fetchCategory', true)
        try {
            if (categoryStore.categoryCacheList.length > 0 && !forceRefresh) {
                return categoryStore.categoryCacheList
            }
            const res = await categoryService.read<ICategory[], ICategoryFilters>()
            categoryStore.setCategory(res)
            return res
        } catch (error) {
            return handleError(error, 'Error fetching categories')
        } finally {
            setCategoryLoadingFor('fetchCategory', false)
        }
    }

    return {
        categoryCacheList: categoryStore.categoryCacheList,
        categoryLoading,
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
