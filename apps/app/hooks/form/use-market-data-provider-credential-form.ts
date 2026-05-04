'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { UpdateMarketDataProviderCredentialRequestSchema } from '@poveroh/schemas'
import { toast } from '@poveroh/ui/components/sonner'
import type { MarketDataProvider, UpdateMarketDataProviderCredentialRequest } from '@poveroh/types'

import { useError } from '@/hooks/use-error'
import { useMarketDataProvider } from '@/hooks/use-market-data-provider'

// Manages provider API key validation and credential mutations.
export const useMarketDataProviderCredentialForm = (provider: MarketDataProvider) => {
    const t = useTranslations()
    const { handleError } = useError()
    const { saveCredentialMutation, deleteCredentialMutation } = useMarketDataProvider()

    const form = useForm<UpdateMarketDataProviderCredentialRequest>({
        resolver: zodResolver(UpdateMarketDataProviderCredentialRequestSchema),
        defaultValues: {
            apiKey: ''
        }
    })

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            console.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    const handleSave = async (values: UpdateMarketDataProviderCredentialRequest) => {
        if (saveCredentialMutation.isPending || deleteCredentialMutation.isPending) return

        try {
            const result = await saveCredentialMutation.mutateAsync({
                path: { providerId: provider.id },
                body: { apiKey: values.apiKey.trim() }
            })

            if (!result?.success) return

            toast.success(t('providers.toast.saved', { a: provider.label }))
            form.reset()
        } catch (error) {
            handleError(error, 'Error saving provider credential')
        }
    }

    const handleDelete = async () => {
        if (saveCredentialMutation.isPending || deleteCredentialMutation.isPending) return

        try {
            const result = await deleteCredentialMutation.mutateAsync({
                path: { providerId: provider.id }
            })

            if (!result?.success) return

            toast.success(t('providers.toast.deleted', { a: provider.label }))
            form.reset()
        } catch (error) {
            handleError(error, 'Error deleting provider credential')
        }
    }

    return {
        form,
        isSaving: saveCredentialMutation.isPending,
        isDeleting: deleteCredentialMutation.isPending,
        handleSave,
        handleDelete
    }
}
