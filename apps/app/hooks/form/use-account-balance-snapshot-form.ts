'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useError } from '@/hooks/use-error'
import { CreateSnapshotAccountBalanceRequest, SnapshotAccountBalance } from '@poveroh/types'

const formSchema = z.object({
    accountId: z.string().uuid(),
    snapshotDate: z.string().date(),
    balance: z.number()
})

export const useAccountBalanceSnapshotForm = (
    initialData: SnapshotAccountBalance | null | undefined,
    initialAccountId?: string
) => {
    const { handleError } = useError()

    const [loading, setLoading] = useState(false)

    const form = useForm<CreateSnapshotAccountBalanceRequest>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            accountId: initialAccountId ?? '',
            snapshotDate: new Date().toISOString().split('T')[0],
            balance: 0
        }
    })

    useEffect(() => {
        if (initialData) {
            form.reset({
                accountId: initialData.accountId,
                snapshotDate: new Date().toISOString().split('T')[0],
                balance: initialData.balance
            })
        }
    }, [initialData, form])

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            console.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    const handleSubmit = async (
        values: CreateSnapshotAccountBalanceRequest,
        dataCallback: (payload: CreateSnapshotAccountBalanceRequest) => Promise<void>
    ) => {
        try {
            setLoading(true)

            values.snapshotDate = new Date(values.snapshotDate).toISOString()

            await dataCallback(values)
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
