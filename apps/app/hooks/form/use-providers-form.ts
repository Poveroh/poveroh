'use client'

import { useCallback } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'

import { useUser } from '@/hooks/use-user'
import { DEFAULT_MARKET_DATA_PROVIDER, DEFAULT_USER_PREFERENCES } from '@poveroh/types'

type ProvidersForm = {
    selectedProviderId: string
}

// Keeps provider selection form state aligned with the currently configured provider list.
export const useProvidersForm = (configuredProviderIds: string[]) => {
    const t = useTranslations()
    const { user, updatePreferences } = useUser()

    const preferences = user?.preferences ?? DEFAULT_USER_PREFERENCES

    const form = useForm<ProvidersForm>({
        defaultValues: {
            selectedProviderId: preferences.preferredMarketDataProviderId || DEFAULT_MARKET_DATA_PROVIDER.id
        }
    })
    const selectedProviderId = useWatch({
        control: form.control,
        name: 'selectedProviderId'
    })

    const isValidProviderId = useCallback(
        (providerId: string) => {
            return providerId === DEFAULT_MARKET_DATA_PROVIDER.id || configuredProviderIds.includes(providerId)
        },
        [configuredProviderIds]
    )

    const handleSubmit = useCallback(
        async (values: ProvidersForm) => {
            if (!user?.id || updatePreferences.isPending) return

            const nextProviderId = isValidProviderId(values.selectedProviderId)
                ? values.selectedProviderId
                : DEFAULT_MARKET_DATA_PROVIDER.id

            if (nextProviderId !== values.selectedProviderId) {
                form.setValue('selectedProviderId', nextProviderId)
                return
            }

            if (preferences.preferredMarketDataProviderId === nextProviderId) return

            const res = await updatePreferences.mutateAsync({
                body: {
                    preferredMarketDataProviderId: nextProviderId
                }
            })

            if (res?.success) {
                toast.success(t('form.messages.userSavedSuccess'))
            }
        },
        [form, isValidProviderId, t, updatePreferences, user?.id, preferences.preferredMarketDataProviderId]
    )

    const canSave =
        !!user?.id &&
        !!selectedProviderId &&
        !updatePreferences.isPending &&
        selectedProviderId !== preferences.preferredMarketDataProviderId

    return {
        form,
        canSave,
        isSaving: updatePreferences.isPending,
        handleSubmit
    }
}
