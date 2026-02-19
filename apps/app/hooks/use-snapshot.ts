'use client'

import { useState } from 'react'
import { useError } from '@/hooks/use-error'
import { SnapshotService } from '@/services/snapshot.service'
import { ISnapshotAccountBalance } from '@poveroh/types'

export const useSnapshot = () => {
    const { handleError } = useError()
    const snapshotService = new SnapshotService()

    const [loading, setLoading] = useState(false)

    const addAccountBalanceSnapshot = async (data: Partial<ISnapshotAccountBalance>) => {
        setLoading(true)
        try {
            return await snapshotService.addAccountBalanceSnapshot(data)
        } catch (error) {
            handleError(error, 'Error saving snapshot')
            return null
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        addAccountBalanceSnapshot
    }
}
