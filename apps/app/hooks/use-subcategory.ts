'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useError } from './use-error'
import {
    createSubcategoryMutation,
    deleteSubcategoryMutation,
    getCategoriesQueryKey,
    getSubcategoryByIdOptions,
    getSubcategoryByIdQueryKey,
    updateSubcategoryMutation
} from '@/api/@tanstack/react-query.gen'
import { SubcategoryData } from '@poveroh/types'

export const useSubcategory = () => {
    const queryClient = useQueryClient()
    const { handleError } = useError()

    const createMutation = useMutation({
        ...createSubcategoryMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getCategoriesQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error adding subcategory')
        }
    })

    const updateMutation = useMutation({
        ...updateSubcategoryMutation(),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: getCategoriesQueryKey() })
            queryClient.invalidateQueries({
                queryKey: getSubcategoryByIdQueryKey({ path: { id: variables.path.id } })
            })
        },
        onError: error => {
            handleError(error, 'Error editing subcategory')
        }
    })

    const deleteMutation = useMutation({
        ...deleteSubcategoryMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getCategoriesQueryKey() })
        },
        onError: error => {
            handleError(error, 'Error deleting subcategory')
        }
    })

    const getSubcategory = async (subcategoryId: string) => {
        try {
            const response = await queryClient.fetchQuery(
                getSubcategoryByIdOptions({
                    path: { id: subcategoryId }
                })
            )

            if (!response?.success) return null

            return (response?.data ?? null) as SubcategoryData | null
        } catch (error) {
            return handleError(error, 'Error fetching subcategory')
        }
    }

    return {
        createSubcategoryMutation: createMutation,
        updateSubcategoryMutation: updateMutation,
        deleteSubcategoryMutation: deleteMutation,
        getSubcategory
    }
}
