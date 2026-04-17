'use client'

import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useError } from '@/hooks/use-error'
import { createSnapshotAccountBalanceMutation } from '@/api/@tanstack/react-query.gen'
import { CreateSnapshotAccountBalanceRequest } from '@poveroh/types'
import type { Snapshot } from '@/lib/api-client'

type SnapshotLoadingState = {
    createSnapshotAccountBalance: boolean
}

export const useSnapshot = () => {
    const { handleError } = useError()

    const [snapshotLoading, setSnapshotLoading] = useState<SnapshotLoadingState>({
        createSnapshotAccountBalance: false
    })

    const createSnapshotAccountBalanceMutationHook = useMutation({
        ...createSnapshotAccountBalanceMutation(),
        onError: error => {
            handleError(error, 'Error saving snapshot')
        }
    })

    const createSnapshotAccountBalance = async (data: CreateSnapshotAccountBalanceRequest) => {
        setSnapshotLoading(prev => ({ ...prev, createSnapshotAccountBalance: true }))
        try {
            const response = await createSnapshotAccountBalanceMutationHook.mutateAsync({
                body: data
            })

            return (response?.data ?? null) as Snapshot | null
        } catch (error) {
            handleError(error, 'Error saving snapshot')
            return null
        } finally {
            setSnapshotLoading(prev => ({ ...prev, createSnapshotAccountBalance: false }))
        }
    }

    return {
        snapshotLoading,
        createSnapshotAccountBalance
    }
}
