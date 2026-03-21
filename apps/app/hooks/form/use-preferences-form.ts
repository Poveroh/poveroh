'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { useUser } from '@/hooks/use-user'
import { toast } from '@poveroh/ui/components/sonner'
import { UserFormPreferencesFormSchema } from '@poveroh/schemas'
import { UserFormPreferencesForm } from '@poveroh/types'

export const usePreferencesForm = () => {
    const t = useTranslations()

    const { user, updateUser } = useUser()

    const form = useForm({
        resolver: zodResolver(UserFormPreferencesFormSchema),
        defaultValues: {
            preferredCurrency: user?.preferredCurrency || 'EUR',
            preferredLanguage: user?.preferredLanguage || 'en',
            dateFormat: user?.dateFormat || 'DD_MM_YYYY',
            timezone: user?.timezone || 'ETC_UTC'
        }
    })

    useEffect(() => {
        if (user && !form.formState.isDirty) {
            form.reset({
                preferredCurrency: user?.preferredCurrency || 'EUR',
                preferredLanguage: user?.preferredLanguage || 'en',
                dateFormat: user?.dateFormat || 'DD_MM_YYYY',
                timezone: user?.timezone || 'ETC_UTC'
            })
            console.log('Form reset with user data')
        }
    }, [user, form])

    const handleSubmit = async (values: UserFormPreferencesForm) => {
        if (updateUser.isPending) return

        try {
            const res = await updateUser.mutateAsync({
                body: values
            })

            if (res && res.success) {
                toast.success(t('form.messages.userSavedSuccess'))
            }
        } catch (error) {
            console.error('Error updating profile:', error)
        }
    }

    return {
        form,
        user,
        loading: updateUser.isPending,
        handleSubmit
    }
}
