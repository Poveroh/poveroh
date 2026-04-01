'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useError } from '@/hooks/use-error'
import { CreateSnapshotAccountBalanceRequest, SnapshotAccountBalance } from '@poveroh/types'
import { SnapshotAccountBalanceSchema } from '@poveroh/schemas'

export const useAccountBalanceSnapshotForm = (
    initialData: SnapshotAccountBalance | null | undefined,
    inEditingMode: boolean,
    initialAccountId?: string
) => {
    const { handleError } = useError()

    const [loading, setLoading] = useState(false)

    const form = useForm<CreateSnapshotAccountBalanceRequest>({
        resolver: zodResolver(SnapshotAccountBalanceSchema),
        defaultValues: {
            accountId: initialAccountId ?? '',
            snapshotDate: new Date().toISOString().split('T')[0],
            balance: 0
        }
    })

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            console.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    const handleSubmit = async (
        values: CreateSnapshotAccountBalanceRequest,
        dataCallback: (payload: CreateSnapshotAccountBalanceRequest, files: File[]) => Promise<void>
    ) => {
        try {
            setLoading(true)

            await dataCallback(values, [])
        } catch (error) {
            handleError(error, 'Form error')
        } finally {
            setLoading(false)
        }
    }

    return {
        form,
        loading,
        handleSubmit
    }
}
