'use client'

import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'

import {
    createAssetTransactionMutation,
    createMarketableAssetMutation,
    deleteAssetMutation,
    deleteAssetsMutation,
    getAssetsOptions,
    getAssetsQueryKey,
    updateMarketableAssetMutation
} from '@/api/@tanstack/react-query.gen'
import { useError } from './use-error'
import { useFilters } from './use-filters'
import { ASSET_TYPE_CATALOG, type AssetFilters } from '@poveroh/types'
import { useMemo } from 'react'
import { useUtils } from './use-utils'

export const useAsset = () => {
    const queryClient = useQueryClient()
    const { handleError } = useError()
    const { renderItemsLabel } = useUtils()

    const filters = useFilters<AssetFilters>(text => ({
        title: { contains: text },
        symbol: { contains: text }
    }))

    const [assetQuery] = useQueries({
        queries: [
            {
                ...getAssetsOptions(filters.activeFilters ? { query: { filter: filters.activeFilters } } : undefined),
                staleTime: Infinity
            }
        ]
    })

    const invalidateAssets = () => {
        queryClient.invalidateQueries({ queryKey: getAssetsQueryKey() })
    }

    const createMarketableMutation = useMutation({
        ...createMarketableAssetMutation(),
        onSuccess: invalidateAssets,
        onError: error => {
            handleError(error, 'Error creating marketable asset')
        }
    })

    const updateMarketableMutation = useMutation({
        ...updateMarketableAssetMutation(),
        onSuccess: invalidateAssets,
        onError: error => {
            handleError(error, 'Error updating marketable asset')
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
        createMarketableMutation,
        updateMarketableMutation,
        deleteMutation,
        deleteAllMutation,
        createTransactionMutation,
        ASSET_TYPE_CATALOG: useMemo(() => renderItemsLabel(ASSET_TYPE_CATALOG), [])
    }
}
