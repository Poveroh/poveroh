'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { useUser } from '@/hooks/use-user'
import { toast } from '@poveroh/ui/components/sonner'
import { UserProfileFormSchema } from '@poveroh/schemas'
import { DEFAULT_USER_PREFERENCES, UserProfileForm } from '@poveroh/types'

export const useProfileForm = () => {
    const t = useTranslations()

    const { user, updateUser, updatePreferences } = useUser()

    const preferences = user?.preferences ?? DEFAULT_USER_PREFERENCES

    const form = useForm({
        resolver: zodResolver(UserProfileFormSchema),
        defaultValues: {
            name: user?.name ?? '',
            surname: user?.surname ?? '',
            email: user?.email ?? '',
            country: preferences.country
        }
    })

    useEffect(() => {
        if (user && !form.formState.isDirty) {
            form.reset({
                name: user?.name ?? '',
                surname: user?.surname ?? '',
                email: user?.email ?? '',
                country: preferences.country
            })
        }
    }, [user, form, preferences])

    const handleSubmit = async (values: UserProfileForm) => {
        if (updateUser.isPending || updatePreferences.isPending) return

        try {
            const userRes = await updateUser.mutateAsync({
                body: {
                    name: values.name,
                    surname: values.surname,
                    email: values.email
                }
            })

            const prefsRes = await updatePreferences.mutateAsync({
                body: {
                    country: values.country
                }
            })

            if (userRes && prefsRes) {
                toast.success(t('form.messages.userSavedSuccess'))
            }
        } catch (error) {
            console.error('Error updating profile:', error)
        }
    }

    return {
        form,
        user,
        loading: updateUser.isPending || updatePreferences.isPending,
        handleSubmit
    }
}
