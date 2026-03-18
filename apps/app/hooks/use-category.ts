'use client'

import { useIsFetching, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCategoryStore } from '@/store/category.store'
import type { Category, Subcategory } from '@/lib/api-client'
import { useError } from './use-error'
import { useImport } from './use-imports'
import {
    createCategoryMutation,
    createSubcategoryMutation,
    deleteCategoriesMutation,
    deleteCategoryMutation,
    deleteSubcategoryMutation,
    getCategoriesOptions,
    getCategoriesQueryKey,
    getCategoryByIdOptions,
    getCategoryByIdQueryKey,
    getSubcategoryByIdOptions,
    getSubcategoryByIdQueryKey,
    updateCategoryMutation,
    updateSubcategoryMutation
} from '@/api/@tanstack/react-query.gen'
import { CategoryData } from '@poveroh/types/contracts'

type CategoryLoadingState = {
    createCategory: boolean
    updateCategory: boolean
    deleteCategory: boolean
    deleteCategories: boolean
    getCategory: boolean
    fetchCategories: boolean
    createSubcategory: boolean
    updateSubcategory: boolean
    deleteSubcategory: boolean
    getSubcategory: boolean
}

export const useCategory = () => {
    const queryClient = useQueryClient()
    const { handleError } = useError()
    const { importTemplates: importFromTemplate } = useImport()
    const categoryStore = useCategoryStore()

    const createCategoryMutationHook = useMutation({
        ...createCategoryMutation(),
        onSuccess: data => {
            const category = data?.data as Category | undefined
            if (category) {
                categoryStore.addCategory(category)
            }
            queryClient.invalidateQueries({ queryKey: getCategoriesQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error adding category')
        }
    })

    const updateCategoryMutationHook = useMutation({
        ...updateCategoryMutation(),
        onSuccess: (data, variables) => {
            const category = (data?.data ?? variables.body) as Category | undefined
            if (category) {
                categoryStore.editCategory(category)
            }
            queryClient.invalidateQueries({ queryKey: getCategoriesQueryKey() })
            queryClient.invalidateQueries({
                queryKey: getCategoryByIdQueryKey({ path: { id: variables.path.id } })
            })
        },
        onError: error => {
            handleError(error, 'Error editing category')
        }
    })

    const deleteCategoryMutationHook = useMutation({
        ...deleteCategoryMutation(),
        onSuccess: (_, variables) => {
            categoryStore.removeCategory(variables.path.id)
            queryClient.invalidateQueries({ queryKey: getCategoriesQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting category')
        }
    })

    const deleteCategoriesMutationHook = useMutation({
        ...deleteCategoriesMutation(),
        onSuccess: () => {
            categoryStore.clearCategory()
            queryClient.invalidateQueries({ queryKey: getCategoriesQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error clearing all categories')
        }
    })

    const createSubcategoryMutationHook = useMutation({
        ...createSubcategoryMutation(),
        onSuccess: data => {
            const subcategory = data?.data as Subcategory | undefined
            if (subcategory) {
                categoryStore.addSubcategory(subcategory)
            }
            queryClient.invalidateQueries({ queryKey: getCategoriesQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error adding subcategory')
        }
    })

    const updateSubcategoryMutationHook = useMutation({
        ...updateSubcategoryMutation(),
        onSuccess: (data, variables) => {
            const subcategory = (data?.data ?? variables.body) as Subcategory | undefined
            if (subcategory) {
                categoryStore.editSubcategory(subcategory)
            }
            queryClient.invalidateQueries({ queryKey: getCategoriesQueryKey() })
            queryClient.invalidateQueries({
                queryKey: getSubcategoryByIdQueryKey({ path: { id: variables.path.id } })
            })
        },
        onError: error => {
            handleError(error, 'Error editing subcategory')
        }
    })

    const deleteSubcategoryMutationHook = useMutation({
        ...deleteSubcategoryMutation(),
        onSuccess: (_, variables) => {
            categoryStore.removeSubcategory(variables.path.id)
            queryClient.invalidateQueries({ queryKey: getCategoriesQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting subcategory')
        }
    })

    const createCategory = async (data: FormData | Partial<CategoryData>) => {
        const bodyData = data instanceof FormData ? JSON.parse(String(data.get('data') || '{}')) : data

        return createCategoryMutationHook.mutateAsync({
            body: bodyData
        })
    }

    const updateCategory = async (id: string, data: Partial<Category>) => {
        const bodyData = data instanceof FormData ? JSON.parse(String(data.get('data') || '{}')) : data

        return updateCategoryMutationHook.mutateAsync({
            path: { id },
            body: bodyData
        })
    }

    const deleteCategory = async (categoryId: string) => {
        return deleteCategoryMutationHook.mutateAsync({
            path: { id: categoryId }
        })
    }

    const getCategory = async (categoryId: string) => {
        try {
            const response = await queryClient.fetchQuery(
                getCategoryByIdOptions({
                    path: { id: categoryId }
                })
            )

            if (!response?.success) return null

            return (response?.data ?? null) as Category | null
        } catch (error) {
            return handleError(error, 'Error fetching category')
        }
    }

    const getSubcategory = async (subcategoryId: string) => {
        try {
            const response = await queryClient.fetchQuery(
                getSubcategoryByIdOptions({
                    path: { id: subcategoryId }
                })
            )

            if (!response?.success) return null

            return (response?.data ?? null) as Subcategory | null
        } catch (error) {
            return handleError(error, 'Error fetching subcategory')
        }
    }

    const fetchCategories = async (forceRefresh = false) => {
        try {
            if (categoryStore.categoryCacheList.length > 0 && !forceRefresh) {
                return categoryStore.categoryCacheList
            }

            const response = await queryClient.fetchQuery(getCategoriesOptions())

            if (!response?.success) return []

            const data = (response?.data ?? []) as Category[]
            categoryStore.setCategory(data)

            return data
        } catch (error) {
            return handleError(error, 'Error fetching categories')
        }
    }

    const createSubcategory = async (data: FormData | Partial<Subcategory>) => {
        const bodyData = data instanceof FormData ? JSON.parse(String(data.get('data') || '{}')) : data
        return createSubcategoryMutationHook.mutateAsync({
            body: bodyData
        })
    }

    const updateSubcategory = async (id: string, data: FormData | Partial<Subcategory>) => {
        const bodyData = data instanceof FormData ? JSON.parse(String(data.get('data') || '{}')) : data

        return updateSubcategoryMutationHook.mutateAsync({
            path: { id },
            body: bodyData
        })
    }

    const deleteSubcategory = async (subcategoryId: string) => {
        return deleteSubcategoryMutationHook.mutateAsync({
            path: { id: subcategoryId }
        })
    }

    const deleteCategories = async () => {
        return deleteCategoriesMutationHook.mutateAsync({})
    }

    const importTemplates = async () => {
        try {
            const res = await importFromTemplate('categories')
            if (res) {
                await fetchCategories(true)
            }
            return res
        } catch (error) {
            return handleError(error, 'Error importing categories from template')
        }
    }

    const categoryLoading: CategoryLoadingState = {
        createCategory: createCategoryMutationHook.isPending,
        updateCategory: updateCategoryMutationHook.isPending,
        deleteCategory: deleteCategoryMutationHook.isPending,
        deleteCategories: deleteCategoriesMutationHook.isPending,
        getCategory:
            useIsFetching({
                predicate: query => {
                    const key = query.queryKey?.[0] as { _id?: string } | undefined
                    return key?._id === 'getCategoryById'
                }
            }) > 0,
        fetchCategories: useIsFetching({ queryKey: getCategoriesQueryKey() }) > 0,
        createSubcategory: createSubcategoryMutationHook.isPending,
        updateSubcategory: updateSubcategoryMutationHook.isPending,
        deleteSubcategory: deleteSubcategoryMutationHook.isPending,
        getSubcategory:
            useIsFetching({
                predicate: query => {
                    const key = query.queryKey?.[0] as { _id?: string } | undefined
                    return key?._id === 'getSubcategoryById'
                }
            }) > 0
    }

    return {
        categoryCacheList: categoryStore.categoryCacheList,
        categoryLoading,
        createCategory,
        updateCategory,
        deleteCategory,
        getCategory,
        fetchCategories,
        createSubcategory,
        updateSubcategory,
        deleteSubcategory,
        getSubcategory,
        importTemplates,
        deleteCategories
    }
}
