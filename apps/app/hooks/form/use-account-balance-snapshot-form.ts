'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useError } from '@/hooks/use-error'
import { ISnapshotAccountBalance } from '@poveroh/types'

export const useAccountBalanceSnapshotForm = (
    initialData: ISnapshotAccountBalance | null | undefined,
    inEditingMode: boolean,
    initialAccountId?: string
) => {
    const t = useTranslations()
    const { handleError } = useError()

    const [loading, setLoading] = useState(false)

    const formSchema = useMemo(
        () =>
            z.object({
                accountId: z.string().nonempty(t('messages.errors.required')),
                snapshotDate: z.string().nonempty(t('messages.errors.required')),
                balance: z
                    .number({
                        required_error: t('messages.errors.required'),
                        invalid_type_error: t('messages.errors.required')
                    })
                    .min(0),
                note: z.string().optional().nullable()
            }),
        [t]
    )

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            accountId: initialAccountId ?? '',
            snapshotDate: new Date().toISOString(),
            balance: 0,
            note: ''
        }
    })

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            console.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    const handleSubmit = async (
        values: z.infer<typeof formSchema>,
        dataCallback: (formData: FormData) => Promise<void>
    ) => {
        try {
            setLoading(true)
            const formData = new FormData()

            formData.append('data', JSON.stringify(inEditingMode ? { ...initialData, ...values } : values))

            await dataCallback(formData)
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
