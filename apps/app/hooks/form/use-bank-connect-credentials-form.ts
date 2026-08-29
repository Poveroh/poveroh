'use client'

import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { z } from 'zod'

import { toast } from '@poveroh/ui/components/sonner'
import type { BankSyncProvider } from '@poveroh/types'

import { useError } from '@/hooks/use-error'
import { useBankSyncConnections } from '@/hooks/use-bank-sync-connections'

export const useBankConnectCredentialsForm = (provider: BankSyncProvider) => {
    const t = useTranslations()
    const { handleError } = useError()
    const { createConnectionMutation } = useBankSyncConnections()

    const schema = useMemo(() => {
        const shape: Record<string, z.ZodString> = {}
        for (const field of provider.credentialFields) {
            shape[field.key] = z.string().trim().min(1)
        }
        return z.object(shape)
    }, [provider.credentialFields])

    const defaultValues = useMemo(
        () => Object.fromEntries(provider.credentialFields.map(field => [field.key, ''])),
        [provider.credentialFields]
    )

    const form = useForm<Record<string, string>>({
        resolver: zodResolver(schema),
        defaultValues
    })

    const handleSave = async (values: Record<string, string>) => {
        if (createConnectionMutation.isPending) return

        try {
            const result = await createConnectionMutation.mutateAsync({
                body: { providerId: provider.id, credentials: values }
            })

            if (!result?.data) return

            toast.success(t('bankSync.toast.connected', { a: provider.label }))
            form.reset()
        } catch (error) {
            handleError(error, 'Error connecting bank provider')
        }
    }

    return {
        form,
        isSaving: createConnectionMutation.isPending,
        handleSave
    }
}
