'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { useUser } from '@/hooks/use-user'
import { toast } from '@poveroh/ui/components/sonner'
import { UserFormPreferencesFormSchema } from '@poveroh/schemas'
import { DEFAULT_USER_PREFERENCES, UserFormPreferencesForm } from '@poveroh/types'
import { logger } from '@poveroh/logger/browser'

export const usePreferencesForm = () => {
    const t = useTranslations()

    const { user, updatePreferences } = useUser()

    const preferences = user?.preferences ?? DEFAULT_USER_PREFERENCES

    const form = useForm({
        resolver: zodResolver(UserFormPreferencesFormSchema),
        defaultValues: {
            preferredCurrency: preferences.preferredCurrency || 'EUR',
            preferredLanguage: preferences.preferredLanguage || 'EN',
            dateFormat: preferences.dateFormat || 'DD_MM_YYYY',
            timezone: preferences.timezone || 'ETC_UTC'
        }
    })

    useEffect(() => {
        if (user && !form.formState.isDirty) {
            form.reset({
                preferredCurrency: preferences.preferredCurrency || 'EUR',
                preferredLanguage: preferences.preferredLanguage || 'EN',
                dateFormat: preferences.dateFormat || 'DD_MM_YYYY',
                timezone: preferences.timezone || 'ETC_UTC'
            })
        }
    }, [user, form, preferences])

    const handleSubmit = async (values: UserFormPreferencesForm) => {
        if (updatePreferences.isPending) return

        try {
            const res = await updatePreferences.mutateAsync({
                body: values
            })

            if (res && res.success) {
                toast.success(t('form.messages.userSavedSuccess'))
            }
        } catch (error) {
            logger.error('Error updating preferences:', error)
        }
    }

    return {
        form,
        user,
        loading: updatePreferences.isPending,
        handleSubmit
    }
}
