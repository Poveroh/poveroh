'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
    completeBankSyncConnectionMutation,
    createBankSyncConnectionMutation,
    deleteBankSyncConnectionMutation,
    getBankSyncProvidersQueryKey,
    linkBankSyncAccountsMutation,
    listBankSyncConnectionsOptions,
    listBankSyncConnectionsQueryKey,
    triggerBankSyncMutation
} from '@/api/@tanstack/react-query.gen'

import { useError } from './use-error'

/**
 * Lists the authenticated user's bank connections and exposes the mutations that create,
 * complete, sync, and revoke them, invalidating both the connections list and the providers list
 * (whose per-provider connection count depends on it) on every mutation.
 * @returns The connections query and data plus the connection lifecycle mutations.
 */
export const useBankSyncConnections = () => {
    const queryClient = useQueryClient()
    const { handleError } = useError()

    const connectionsQuery = useQuery({
        ...listBankSyncConnectionsOptions(),
        staleTime: 10 * 1000
    })

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: listBankSyncConnectionsQueryKey() })
        queryClient.invalidateQueries({ queryKey: getBankSyncProvidersQueryKey() })
    }

    const createConnectionMutation = useMutation({
        ...createBankSyncConnectionMutation(),
        onSuccess: invalidate,
        onError: error => handleError(error, 'Error starting bank connection')
    })

    const completeConnectionMutation = useMutation({
        ...completeBankSyncConnectionMutation(),
        onSuccess: invalidate,
        onError: error => handleError(error, 'Error completing bank connection')
    })

    const triggerSyncMutation = useMutation({
        ...triggerBankSyncMutation(),
        onError: error => handleError(error, 'Error triggering bank sync')
    })

    const deleteConnectionMutation = useMutation({
        ...deleteBankSyncConnectionMutation(),
        onSuccess: invalidate,
        onError: error => handleError(error, 'Error disconnecting bank connection')
    })

    const linkAccountsMutation = useMutation({
        ...linkBankSyncAccountsMutation(),
        onError: error => handleError(error, 'Error mapping bank accounts')
    })

    return {
        connectionsQuery,
        connections: connectionsQuery.data?.data ?? [],
        createConnectionMutation,
        completeConnectionMutation,
        triggerSyncMutation,
        deleteConnectionMutation,
        linkAccountsMutation
    }
}
