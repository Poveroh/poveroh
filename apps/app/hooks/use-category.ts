'use client'

import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { useError } from './use-error'
import { useImport } from './use-imports'
import {
    createCategoryMutation,
    deleteCategoriesMutation,
    deleteCategoryMutation,
    getCategoriesOptions,
    getCategoriesQueryKey,
    getCategoryByIdOptions,
    getCategoryByIdQueryKey,
    updateCategoryMutation
} from '@/api/@tanstack/react-query.gen'
import { CategoryData, CategoryFilters } from '@poveroh/types'
import { useFilters } from './use-filters'

export const useCategory = () => {
    const queryClient = useQueryClient()
    const { handleError } = useError()
    const { importTemplates: importFromTemplate } = useImport()

    const filters = useFilters<CategoryFilters>(text => ({
        title: { contains: text }
    }))

    const [categoryQuery] = useQueries({
        queries: [
            {
                ...getCategoriesOptions(
                    filters.activeFilters ? { query: { filter: filters.activeFilters } } : undefined
                ),
                staleTime: Infinity
            }
        ]
    })

    const createMutation = useMutation({
        ...createCategoryMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getCategoriesQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error adding category')
        }
    })

    const updateMutation = useMutation({
        ...updateCategoryMutation(),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: getCategoriesQueryKey() })
            queryClient.invalidateQueries({
                queryKey: getCategoryByIdQueryKey({ path: { id: variables.path.id } })
            })
        },
        onError: error => {
            handleError(error, 'Error editing category')
        }
    })

    const deleteMutation = useMutation({
        ...deleteCategoryMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getCategoriesQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting category')
        }
    })

    const deleteAllMutation = useMutation({
        ...deleteCategoriesMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getCategoriesQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error clearing all categories')
        }
    })

    const getCategoryById = async (categoryId: string) => {
        try {
            const response = await queryClient.fetchQuery(
                getCategoryByIdOptions({
                    path: { id: categoryId }
                })
            )

            if (!response?.success) return null

            return (response?.data ?? null) as CategoryData | null
        } catch (error) {
            return handleError(error, 'Error fetching category')
        }
    }

    const importTemplates = async () => {
        try {
            const res = await importFromTemplate('categories')
            if (res) {
                queryClient.invalidateQueries({ queryKey: getCategoriesQueryKey() })
            }
            return res
        } catch (error) {
            return handleError(error, 'Error importing categories from template')
        }
    }

    return {
        ...filters,
        categoryQuery,
        categoryData: categoryQuery.data?.data ?? [],
        createCategoryMutation: createMutation,
        updateCategoryMutation: updateMutation,
        deleteCategoryMutation: deleteMutation,
        deleteAllCategoryMutation: deleteAllMutation,
        importTemplates,
        getCategoryById
    }
}
