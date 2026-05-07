'use client'

import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'

import {
    createAssetMutation,
    createAssetTransactionMutation,
    deleteAssetMutation,
    deleteAssetsMutation,
    getAssetsOptions,
    getAssetsQueryKey,
    getPortfolioSummaryOptions,
    getPortfolioSummaryQueryKey,
    updateAssetMutation
} from '@/api/@tanstack/react-query.gen'
import { useError } from './use-error'
import { useFilters } from './use-filters'
import type { AssetFilters } from '@poveroh/types'

export const useAsset = () => {
    const queryClient = useQueryClient()
    const { handleError } = useError()

    const filters = useFilters<AssetFilters>(text => ({
        title: { contains: text },
        symbol: { contains: text }
    }))

    const [assetQuery, portfolioSummaryQuery] = useQueries({
        queries: [
            {
                ...getAssetsOptions(filters.activeFilters ? { query: { filter: filters.activeFilters } } : undefined),
                staleTime: Infinity
            },
            {
                ...getPortfolioSummaryOptions(),
                staleTime: Infinity
            }
        ]
    })

    const invalidateAssets = () => {
        queryClient.invalidateQueries({ queryKey: getAssetsQueryKey() })
        queryClient.invalidateQueries({ queryKey: getPortfolioSummaryQueryKey() })
    }

    const createMutation = useMutation({
        ...createAssetMutation(),
        onSuccess: invalidateAssets,
        onError: error => {
            handleError(error, 'Error creating asset')
        }
    })

    const updateMutation = useMutation({
        ...updateAssetMutation(),
        onSuccess: invalidateAssets,
        onError: error => {
            handleError(error, 'Error updating asset')
        }
    })

    const deleteMutation = useMutation({
        ...deleteAssetMutation(),
        onSuccess: invalidateAssets,
        onError: error => {
            handleError(error, 'Error deleting asset')
        }
    })

    const deleteAllMutation = useMutation({
        ...deleteAssetsMutation(),
        onSuccess: invalidateAssets,
        onError: error => {
            handleError(error, 'Error deleting all assets')
        }
    })

    const createTransactionMutation = useMutation({
        ...createAssetTransactionMutation(),
        onSuccess: invalidateAssets,
        onError: error => {
            handleError(error, 'Error creating asset transaction')
        }
    })

    return {
        ...filters,
        assetQuery,
        portfolioSummaryQuery,
        createMutation,
        updateMutation,
        deleteMutation,
        deleteAllMutation,
        createTransactionMutation
    }
}
